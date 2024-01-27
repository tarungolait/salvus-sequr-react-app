import psycopg2

# Database connection configuration
db_config = {
    'user': 'postgres',
    'password': 'zaynmalik2002',
    'host': 'localhost',
    'port': '5432',
    'database': 'infinicue',
}

def create_tables():
    try:
        # Connect to PostgreSQL
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        # Create data_entry table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS data_entry (
                barcodeno VARCHAR(255),
                wallet_type VARCHAR(255),
                walletcolor VARCHAR(255),
                manufacturingdate DATE,
                batchnum VARCHAR(255),
                countrycode VARCHAR(255),
                qrcode TEXT,
                blemacid VARCHAR(255),
                version VARCHAR(255),
                barcode_location TEXT,
                qrcode_location TEXT
            )
        """)
        
        # Create product_types table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS product_types (
                id SERIAL PRIMARY KEY,
                wallet_type VARCHAR(255),
                description TEXT
            )
        """)
        
        # Create version table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS version (
                id SERIAL PRIMARY KEY,
                version_number VARCHAR(255)
            )
        """)
        
        # Create wallet_colors table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS wallet_colors (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255)
            )
        """)

        # Add sample data to version table
        cursor.execute("""
            INSERT INTO version (version_number) VALUES ('1.0'), ('2.0'), ('3.0')
        """)
        
        # Add sample data to product_types table
        cursor.execute("""
            INSERT INTO product_types (wallet_type, description) VALUES 
            ('Type A', 'Description for Type A'),
            ('Type B', 'Description for Type B'),
            ('Type C', 'Description for Type C')
        """)
        
        # Add sample data to wallet_colors table
        cursor.execute("""
            INSERT INTO wallet_colors (name) VALUES 
            ('Red'), ('Blue'), ('Green'), ('Yellow')
        """)

        # Commit the transaction
        connection.commit()
        print("Tables created successfully!")

    except Exception as e:
        print("Error:", e)

    finally:
        if connection:
            cursor.close()
            connection.close()

if __name__ == "__main__":
    create_tables()
