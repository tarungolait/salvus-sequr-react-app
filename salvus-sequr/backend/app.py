from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import psycopg2
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from queue import Queue
from threading import Thread
from pyqrcode import create as pyqrcode_create
from barcode import EAN13
from barcode.writer import SVGWriter


app = Flask(__name__)
CORS(app)

# Database connection configuration
db_config = {
    'user': 'postgres',
    'password': 'zaynmalik2002',
    'host': 'localhost',
    'port': '5432',
    'database': 'infinicue',
}

BAR_QR_FOLDER = 'salvus-sequr/backend/BAR_QR_FOLDER'



# Enable CORS for all routes
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


# Endpoint for data entry
@app.route('/api/data-entry', methods=['POST'])
def add_data_entry():
    try:
        data = request.json  # Assuming the frontend sends data in JSON format
        # Connect to PostgreSQL
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        # Insert data into PostgreSQL tables
        postgres_insert_query = """INSERT INTO data_entry (barcodeno, wallet_type, walletcolor, manufacturingdate, batchnum, countrycode, qrcode, blemacid, version, barcode_location, qrcode_location) 
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        record_to_insert = (
            data['barcodeno'],
            data['wallet_type'],
            data['walletcolor'],
            data['manufacturingdate'],
            data['batchnum'],
            data['countrycode'],
            data['qrcode'],
            data['blemacid'],
            data['version'],
            '',  # Initialize barcode_location (will be updated later)
            '',  # Initialize qrcode_location (will be updated later)
        )
        cursor.execute(postgres_insert_query, record_to_insert)
        connection.commit()
        count_records = cursor.rowcount

        # Dynamically generate QR code and barcode based on user input
        qrcode_url, barcode_url = generate_codes(data['qrcode'], data['barcodeno'], data['version'], data['wallet_type'], data['blemacid'])

        # Update the database with the generated URLs
        update_urls_query = """UPDATE data_entry SET qrcode_location = %s, barcode_location = %s WHERE barcodeno = %s"""
        cursor.execute(update_urls_query, (qrcode_url, barcode_url, data['barcodeno']))
        connection.commit()

        return jsonify({
            'message': f'{count_records} Record(s) inserted successfully into data_entry table',
            'qrcode_url': qrcode_url,
            'barcode_url': barcode_url
        })

    except Exception as error:
        return jsonify({'error': str(error)})

    finally:
        if connection:
            cursor.close()
            connection.close()

# Endpoint for deleting a row by MAC ID
@app.route('/api/delete-data/<mac_id>', methods=['DELETE'])
def delete_data_entry(mac_id):
    try:
        # Connect to PostgreSQL
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        # Delete row from data_entry table by MAC ID
        postgres_delete_query = """DELETE FROM data_entry WHERE blemacid = %s"""
        cursor.execute(postgres_delete_query, (mac_id,))
        connection.commit()
        count_records = cursor.rowcount

        if count_records > 0:
            return jsonify({'message': f'{count_records} Record(s) deleted successfully'})
        else:
            return jsonify({'message': 'No records found for the given MAC ID'})

    except Exception as error:
        return jsonify({'error': str(error)})

    finally:
        if connection:
            cursor.close()
            connection.close()

@app.route('/api/search-data/<search_query>', methods=['GET'])
def search_data(search_query):
    try:
        # Connect to PostgreSQL
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        # Perform the search in the data_entry table and join with product_types
        postgres_search_query = """
            SELECT
                data_entry.*,
                COALESCE(product_types.description, 'N/A') as product_description
            FROM
                data_entry
            LEFT JOIN
                product_types ON data_entry.wallet_type = product_types.wallet_type
            WHERE
                data_entry.blemacid = %s OR data_entry.barcodeno = %s OR data_entry.qrcode = %s
        """
        cursor.execute(postgres_search_query, (search_query, search_query, search_query))
        search_result = cursor.fetchall()

        return jsonify(search_result)

    except Exception as error:
        return jsonify({'error': str(error)})

    finally:
        if connection:
            cursor.close()
            connection.close()

# Function to generate QR code and barcode dynamically
def generate_codes(qrcode_data, barcode_data, version, wallet_type, blemacid):
    encrypted_data = encrypt_data(qrcode_data, barcode_data, version, wallet_type, blemacid)

    # Generate QR code dynamically
    qrcode_url = generate_qrcode(encrypted_data, barcode_data)

    # Generate barcode dynamically
    barcode_url = generate_barcode(barcode_data, barcode_data)

    return qrcode_url, barcode_url




def encrypt_data(qrcode, blemacid, barcodeno, version, wallet_type):
    site = [qrcode, ',', blemacid, ',', barcodeno, ',', version, ',', wallet_type,
            ',\x10\x10\x10\x10\x10\x10\x10\x10\x10\x10\x10\x10\x10\x10\x10\x10\x10']
    str_qr = ''.join(site)
    qr_byte = str_qr.encode('utf-8')

   
    key = 'helloworldhelloo'.encode('utf-8')
    iv = 'helloworldhelloo'.encode('utf-8')
    aes = AES.new(key, AES.MODE_CBC, iv)

    # Encrypt the data directly
    encrypted_data = aes.encrypt(qr_byte)

    encoded_data = str(base64.encodebytes(encrypted_data), encoding='utf-8')

    return encoded_data




def generate_qrcode(qr_data, filename, scale_factor=5):
    qr_code = pyqrcode_create(qr_data)
    qr_code_filename = f"{filename}_qrcode.svg"
    qr_code_path = os.path.join(BAR_QR_FOLDER, qr_code_filename)
    qr_code.svg(qr_code_path, scale=scale_factor)
    print(f"QR Code saved successfully at: {qr_code_path}")

    # Return the URL
    return f"http://127.0.0.1:5500/{qr_code_path}"


def generate_barcode(barcode_data, filename):
    my_code = EAN13(barcode_data, writer=SVGWriter())
    barcode_filename = f"{filename}_barcode"
    barcode_path = os.path.join(BAR_QR_FOLDER, barcode_filename)
    my_code.save(barcode_path)
    print(f"Barcode saved successfully at: {barcode_path}")

    # Return the URL
    return f"http://127.0.0.1:5500/{barcode_path}.svg"

# Fetch product types from the database
@app.route('/api/product-types', methods=['GET'])
def get_product_types():
    try:
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        postgres_product_types_query = """SELECT * FROM product_types"""
        cursor.execute(postgres_product_types_query)
        product_types = cursor.fetchall()

        # Format the data as a list of dictionaries
        formatted_product_types = [{'id': row[0], 'name': row[1]} for row in product_types]

        return jsonify(formatted_product_types)

    except Exception as error:
        return jsonify({'error': str(error)})

    finally:
        if connection:
            cursor.close()
            connection.close()

from flask import jsonify, request

# Fetch product types from the database for the new endpoint
@app.route('/api/new-product-types', methods=['GET', 'PUT'])
def handle_new_product_types():
    if request.method == 'GET':
        # Fetch product types
        try:
            connection = psycopg2.connect(**db_config)
            cursor = connection.cursor()

            postgres_product_types_query = """SELECT * FROM product_types"""
            cursor.execute(postgres_product_types_query)
            product_types = cursor.fetchall()

            # Format the data as a list of dictionaries
            formatted_product_types = [{'id': row[0], 'wallet_type': row[1], 'description': row[2]} for row in product_types]

            return jsonify(formatted_product_types)

        except Exception as error:
            return jsonify({'error': str(error)})

        finally:
            if connection:
                cursor.close()
                connection.close()

    elif request.method == 'PUT':
        # Update product types
        try:
            connection = psycopg2.connect(**db_config)
            cursor = connection.cursor()

            updated_product_types = request.json

            for product_type in updated_product_types:
                cursor.execute(
                    "UPDATE product_types SET wallet_type = %s, description = %s WHERE id = %s",
                    (product_type['wallet_type'], product_type['description'], product_type['id'])
                )

            connection.commit()

            return jsonify({'message': 'Product types updated successfully'})

        except Exception as error:
            connection.rollback()  # Rollback changes in case of an error during update
            return jsonify({'error': str(error)})

        finally:
            if connection:
                cursor.close()
                connection.close()



# Fetch versions from the database
@app.route('/api/versions', methods=['GET'])
def get_versions():
    try:
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        postgres_versions_query = """SELECT * FROM version"""
        cursor.execute(postgres_versions_query)
        versions = cursor.fetchall()

        # Format the data as a list of dictionaries
        formatted_versions = [{'id': row[0], 'version_number': row[1]} for row in versions]

        return jsonify(formatted_versions)

    except Exception as error:
        return jsonify({'error': str(error)})

    finally:
        if connection:
            cursor.close()
            connection.close()

# Fetch wallet colors from the database
@app.route('/api/wallet-colors', methods=['GET'])
def get_wallet_colors():
    try:
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        postgres_wallet_colors_query = """SELECT * FROM wallet_colors"""
        cursor.execute(postgres_wallet_colors_query)
        wallet_colors = cursor.fetchall()

        # Format the data as a list of dictionaries
        formatted_wallet_colors = [{'id': row[0], 'name': row[1]} for row in wallet_colors]

        return jsonify(formatted_wallet_colors)

    except Exception as error:
        return jsonify({'error': str(error)})

    finally:
        if connection:
            cursor.close()
            connection.close()

# Add this route in your Flask app
@app.route('/api/check-duplicate/<blemacid>', methods=['GET'])
def check_duplicate_entry(blemacid):
    try:
        # Connect to PostgreSQL
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        # Check if the given blemacid already exists in the data_entry table
        postgres_duplicate_query = """SELECT COUNT(*) FROM data_entry WHERE blemacid = %s"""
        cursor.execute(postgres_duplicate_query, (blemacid,))
        count_records = cursor.fetchone()[0]

        return jsonify({'duplicate': count_records > 0})

    except Exception as error:
        return jsonify({'error': str(error)})

    finally:
        if connection:
            cursor.close()
            connection.close()


if __name__ == '__main__':
    app.run(debug=True)

