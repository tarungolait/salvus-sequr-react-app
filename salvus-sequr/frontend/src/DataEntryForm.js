import React, { useState, useEffect } from "react";
import axios from "axios";

import "./DataEntryForm.css";

const DataEntryForm = () => {
  const [formData, setFormData] = useState({
    blemacid: "",
    wallet_type: "",
    walletcolor: "",
    manufacturingdate: new Date().toISOString().split("T")[0],
    batchnum: "012003202102",
    countrycode: "890",
    qrcode: "",
    barcodeno: "",
    version: "",
  });

  const [macIdToDelete, setMacIdToDelete] = useState("");
  const [submitButtonText, setSubmitButtonText] = useState("Submit");
  const [notification, setNotification] = useState(null);
  const [locationUrls, setLocationUrls] = useState({
    barcode_location: "",
    qrcode_location: "",
  });

  const [productTypes, setProductTypes] = useState([]);
  const [walletColors, setWalletColors] = useState([]);
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    // Fetch product types
    axios.get("http://localhost:5000/api/product-types")
      .then(response => setProductTypes(response.data))
      .catch(error => console.error("Error fetching product types:", error));

    // Fetch wallet colors
    axios.get("http://localhost:5000/api/wallet-colors")
      .then(response => setWalletColors(response.data))
      .catch(error => console.error("Error fetching wallet colors:", error));

    // Fetch versions
    axios.get("http://localhost:5000/api/versions")
      .then(response => setVersions(response.data))
      .catch(error => console.error("Error fetching versions:", error));

    const lastUsedQRCode = localStorage.getItem("lastUsedQRCode") || "00000";
    const lastUsedBarcode = localStorage.getItem("lastUsedBarcode") || "";

    setFormData((prevData) => ({
      ...prevData,
      qrcode: lastUsedQRCode,
      barcodeno: lastUsedBarcode,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    if (name === "qrcode") {
      const countryCode = "890";
      const currentYear = new Date().getFullYear();
      const barcodeno = `${countryCode}${currentYear}${value}`;
      updatedFormData = { ...updatedFormData, barcodeno };
    }

    setFormData(updatedFormData);
  };

  const validateBleMacIdFormat = (macId) => {
    const macIdRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
    return macIdRegex.test(macId);
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const requiredFields = ["blemacid", "wallet_type", "walletcolor", "batchnum", "version"];
    const isFormValid = requiredFields.every((field) => formData[field].trim() !== "");
  
    if (!isFormValid) {
      showNotification("Please fill in all required fields", "error");
      return;
    }
    if (!validateBleMacIdFormat(formData.blemacid)) {
      showNotification("Invalid BLE MAC ID format", "error");
      return;
    }
  
    try {
      // Check if the same blemacid already exists in the table
      const checkDuplicateResponse = await axios.get(`http://localhost:5000/api/check-duplicate/${formData.blemacid}`);
      if (checkDuplicateResponse.data.duplicate) {
        showNotification("Duplicate entry: Blemacid already exists", "error");
        return;
      }
  
      // Continue with data submission if not a duplicate
      const response = await axios.post("http://localhost:5000/api/data-entry", {
        ...formData,
        ...locationUrls,
      });
  
      // Check if the data entry was successful
      if (response.data.message === "Record(s) inserted successfully into data_entry table") {
        // Trigger code generation
        const generateCodesResponse = await axios.post("http://localhost:5000/api/generate-codes", {
          ...formData,
        });
  
        // Log the message from the code generation response
        console.log(generateCodesResponse.data.message);
      }
  
      // Update local storage and reset form data
      const nextQRCodeValue = String(Number(formData.qrcode) + 1).padStart(5, "0");
      localStorage.setItem("lastUsedQRCode", nextQRCodeValue);
  
      const countryCode = "890";
      const currentYear = new Date().getFullYear();
      const nextBarcodeValue = `${countryCode}${currentYear}${nextQRCodeValue}`;
      localStorage.setItem("lastUsedBarcode", nextBarcodeValue);
  
      setFormData({
        blemacid: "",
        wallet_type: "",
        walletcolor: "",
        manufacturingdate: new Date().toISOString().split("T")[0],
        batchnum: "012003202102",
        countrycode: "890",
        qrcode: nextQRCodeValue,
        barcodeno: nextBarcodeValue,
        version: "",
      });
  
      showNotification("Data added successfully", "success");
    } catch (error) {
      console.error("Error submitting data:", error.message);
  
      if (error.response && error.response.status === 409) {
        showNotification("Duplicate entry: Blemacid already exists", "error");
      } else {
        showNotification("Error submitting data", "error");
      }
    }
  };
  

  const handleDelete = async (macId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/delete-data/${macId}`);
      showNotification(response.data.message, "success");
      setMacIdToDelete("");
    } catch (error) {
      console.error("Error deleting data:", error.message);
      showNotification("Error deleting data", "error");
    }
  };

  const handlePrint = () => {
    window.print();
  };



  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <table className="data-entry-table">
          <tbody>
            <tr>
              <td>
                <h2>BLE MAC ID:</h2>
              </td>
              <td>
                <input
                  type="text"
                  name="blemacid"
                  value={formData.blemacid}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>
                <h2>PRODUCT TYPE:</h2>
              </td>
              <td>
                <select
                  name="wallet_type"
                  value={formData.wallet_type}
                  onChange={handleChange}
                >
                  <option value="">Select type</option>
                  {productTypes.map((type) => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td>
                <h2>WALLET COLOR:</h2>
              </td>
              <td>
                <select
                  name="walletcolor"
                  value={formData.walletcolor}
                  onChange={handleChange}
                >
                  <option value="">Select color</option>
                  {walletColors.map((color) => (
                    <option key={color.id} value={color.name}>{color.name}</option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td>
                <h2>BATCH NUMBER:</h2>
              </td>
              <td>
                <input
                  type="text"
                  name="batchnum"
                  value={formData.batchnum}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>
                <h2>QR CODE:</h2>
              </td>
              <td>
                <input
                  type="text"
                  name="qrcode"
                  value={formData.qrcode}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>
                <h2>BARCODE NO:</h2>
              </td>
              <td>
                <input
                  type="text"
                  name="barcodeno"
                  value={formData.barcodeno}
                  onChange={handleChange}
                  readOnly
                />
              </td>
            </tr>
            <tr>
              <td>
                <h2>VERSION:</h2>
              </td>
              <td>
                <select
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                >
                  <option value="">Select version</option>
                  {versions.map((ver) => (
                    <option key={ver.id} value={ver.version_number}>{ver.version_number}</option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td>
                <h2>ENTER MAC ID TO DELETE:</h2>
              </td>
              <td>
                <input
                  type="text"
                  name="macIdToDelete"
                  value={macIdToDelete}
                  onChange={(e) => setMacIdToDelete(e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="button-container">
          <button type="submit">{submitButtonText}</button>
          <button type="button" onClick={() => handleDelete(macIdToDelete)}>
            Delete
          </button>
          <button type="button" onClick={handlePrint}>
            Print
          </button>
        </div>
      </form>
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};


export default DataEntryForm;
