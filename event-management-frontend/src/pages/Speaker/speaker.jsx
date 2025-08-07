import React, { useState, useRef, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import axios from "axios";
import { toast } from "react-toastify";
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import SpeakerPDFDocument from './SpeakerPDFDocument';
import uploadImg from '../../assets/image.png';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { useParams } from "react-router-dom";
const Speaker = () => {
  const { eventId } = useParams();
  const token = localStorage.getItem("token");
  const [isOpenExport, setIsOpenExport] = useState(false);
  const [empty, setEmpty] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownExportRef = useRef(null);
  const dropdownLevelRef = useRef(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState(null);

  useEffect(() => {
    if (toastMessage && toastType) {
      if (toastType === "info") toast.info(toastMessage);
      else if (toastType === "success") toast.success(toastMessage);
      else if (toastType === "error") toast.error(toastMessage);
      else if (toastType === "warn") toast.warn(toastMessage);
      setToastType(null);
      setToastMessage(null);
    }
  }, [toastMessage]);

  const initialSpeakerState = {
    speakerId: "",
    speakerName: "",
    speakerImage: "",
    speakerImageFile: "",
    speakerEmail: "",
    speakerPhone: "",
    speakerDesc: "",
  };

  const [speakers, setSpeakers] = useState([]);
  const [newSpeaker, setNewSpeaker] = useState(initialSpeakerState);

  const filteredSpeakers = speakers.filter((speaker) => {
    const matchesSearch =
      speaker.speakerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.speakerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch ;
  });

  const fetchSpeakers = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/myevent/${eventId}/speaker`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpeakers(response.data.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Can't get the list of speakers!";
      setToastMessage(errorMessage);
      setToastType("error");
    }
  };

  useEffect(() => {
    fetchSpeakers();
  }, []);


  const toggleDropdownExport = () => {
    setIsOpenExport(!isOpenExport);

  };


 

  const checkInput = (speaker, newEmpty) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0[1-9][0-9]{8}|84[1-9][0-9]{8})$/;
    if (!speaker.speakerName?.trim()) newEmpty.speakerName = "Please fill in field.";
    if (!speaker.speakerEmail?.trim()) {
      newEmpty.speakerEmail = "Please fill in field.";
    } else if (!emailRegex.test(speaker.speakerEmail)) {
      newEmpty.speakerEmail = "Invalid email.";
    }
    if (!speaker.speakerPhone?.trim()) {
      newEmpty.speakerPhone = "Please fill in field.";
    } else if (!phoneRegex.test(speaker.speakerPhone)) {
      newEmpty.speakerPhone = "Invalid phone.";
    }
    if (!speaker.speakerDesc?.trim()) newEmpty.speakerDesc = "Please fill in field.";
    if (!speaker.speakerExperience?.trim()) newEmpty.speakerExperience = "Please fill in field.";

  };

  const addSpeakerHandle = async (e) => {
    e.preventDefault();
    let newEmpty = {};
    checkInput(newSpeaker, newEmpty);
    if (Object.keys(newEmpty).length > 0) {
      setEmpty(newEmpty);
      return;
    }
    const formData = new FormData();
    Object.entries(newSpeaker).forEach(([key, value]) => {
      if (value) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (key !== "speakerImage") {
          formData.append(key, value);
        }
      }
    });
    try {
      const response = await axios.post(
        `http://localhost:8080/api/v1/myevent/${eventId}/speaker`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setToastMessage(response.data.msg || "Speaker added successfully!");
      setToastType("success");
      setNewSpeaker(initialSpeakerState);
      setEmpty({});
      document.getElementById("add-speaker").classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
      fetchSpeakers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Can't add speaker!";
      setToastMessage(errorMessage);
      setToastType("error");
    }
  };

  const editSpeakerHandle = async (e) => {
    e.preventDefault();
    let newEmpty = {};
    checkInput(selectedSpeaker, newEmpty);
    if (Object.keys(newEmpty).length > 0) {
      setEmpty(newEmpty);
      return;
    }
    const formData = new FormData();
    Object.entries(selectedSpeaker).forEach(([key, value]) => {
      if (value) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value);
        }
      }
    });
    try {
      const response = await axios.put(
        `http://localhost:8080/api/v1/myevent/${eventId}/speaker/${selectedSpeaker.speakerId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setToastMessage(response.data.msg || "Speaker updated successfully!");
      setToastType("success");
      setSelectedSpeaker(null);
      setEmpty({});
      document.getElementById("edit-speaker").classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
      fetchSpeakers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Can't update speaker!";
      setToastMessage(errorMessage);
      setToastType("error");
    }
  };

  const handleDeleteSpeaker = async (selectedSpeaker) => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/v1/myevent/${eventId}/speaker/${selectedSpeaker.speakerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setToastMessage(response.data.msg || "Speaker deleted successfully!");
      setToastType("success");
      setSpeakers((prev) => prev.filter((speaker) => speaker.speakerId !== selectedSpeaker.speakerId));
      setSelectedSpeaker(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Can't delete speaker!";
      setToastMessage(errorMessage);
      setToastType("error");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalPages = Math.ceil(filteredSpeakers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredSpeakers.length);
  const currentSpeakers = filteredSpeakers.slice(startIndex, endIndex);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  const exportToPDF = async () => {
    try {

      const doc = <SpeakerPDFDocument speakers={speakers} />;
      const asPdf = pdf([]);
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      saveAs(blob, 'speaker_list.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToastMessage('Failed to generate PDF');
      setToastType('error');
    }
  };
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Speakers');

    worksheet.columns = [
      { header: 'ID', key: 'speakerId', width: 10 },
      { header: 'Name', key: 'speakerName', width: 20 },
      { header: 'Email', key: 'speakerEmail', width: 30 },
      { header: 'Phone', key: 'speakerPhone', width: 15 },
      { header: 'Description', key: 'speakerDesc', width: 30 },

    ];

    speakers.forEach(s => {
      worksheet.addRow(s);
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' },
      };
      cell.alignment = { horizontal: 'center' };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'speakers.xlsx');
  };
  const handleExport = (option) => {
    if (option === "Export as PDF") {
      exportToPDF();
    } else if (option === "Export as Excel") {
      exportToExcel();
    }
    setIsOpenExport(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownExportRef.current && !dropdownExportRef.current.contains(event.target)) {
        setIsOpenExport(false);
      }
      
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeAddSpeakerModal = () => {
    document.getElementById("add-speaker").classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    setNewSpeaker(initialSpeakerState);
    setEmpty({});
  };

  const closeEditSpeakerModal = () => {
    document.getElementById("edit-speaker").classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    setSelectedSpeaker(null);
    setEmpty({});
  };

  const SpeakerUpload = ({ speaker, setSpeaker }) => {
    const fileInputRef = useRef(null);

    const handleButtonClick = () => fileInputRef.current.click();

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setSpeaker((prev) => ({ ...prev, speakerImageFile: file }));
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setSpeaker((prev) => ({ ...prev, speakerImage: reader.result }));
        };
      }
    };

    return (
      <div className="flex flex-wrap items-center gap-4 bg-gray-100 w-full rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center w-20 h-20 rounded-full border border-gray-300 overflow-hidden flex-shrink-0 mr-2 text-gray-800 font-bold">
          <img src={speaker?.speakerImage || uploadImg} alt="Speaker" className="w-[70%] h-[70%]" />
        </div>
        <div className="flex-1">
          <div className="text-base font-bold mb-2">Upload Speaker Image</div>
          <p className="text-xs text-gray-600">Image should be below 4 MB</p>
          <div className="flex items-center gap-2.5">
            <label onClick={handleButtonClick} className="text-xs px-2 py-1 bg-orange-500 text-white rounded cursor-pointer">Upload</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <a
              onClick={() => setSpeaker((prev) => ({ ...prev, speakerImage: "", speakerImageFile: "" }))}
              className="text-sm bg-gray-200 rounded cursor-pointer text-gray-900 hover:bg-gray-300"
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 text-gray-500 font-roboto text-sm">
      {/* Add Speaker Modal */}
      <div id="add-speaker" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-hidden="true">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h4 className="text-xl font-semibold text-gray-900">Add New Speaker</h4>
            <button type="button" className="text-gray-500 hover:text-gray-700" onClick={closeAddSpeakerModal}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <form>
            <div className="p-4 pt-0">
              <div className="flex flex-wrap -mx-3">
                <div className="w-full px-3">
                  <SpeakerUpload speaker={newSpeaker} setSpeaker={setNewSpeaker} />
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={newSpeaker.speakerName}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, speakerName: e.target.value })}
                    />
                  </div>
                  {empty.speakerName && <p className="text-red-500 text-sm">{empty.speakerName}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={newSpeaker.speakerEmail}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, speakerEmail: e.target.value })}
                    />
                  </div>
                  {empty.speakerEmail && <p className="text-red-500 text-sm">{empty.speakerEmail}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={newSpeaker.speakerPhone}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, speakerPhone: e.target.value })}
                    />
                  </div>
                  {empty.speakerPhone && <p className="text-red-500 text-sm">{empty.speakerPhone}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Description <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={newSpeaker.speakerDesc}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, speakerDesc: e.target.value })}
                    />
                  </div>
                  {empty.speakerDesc && <p className="text-red-500 text-sm">{empty.speakerDesc}</p>}
                </div>
              

              </div>
            </div>
            <div className="flex items-center justify-end p-4 border-t border-gray-200">
              <button type="button" className="px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-200 rounded hover:bg-gray-300" onClick={closeAddSpeakerModal}>
                Cancel
              </button>
              <button type="submit" className="ml-2 px-3 py-2 text-sm font-semibold text-white bg-orange-500 rounded hover:bg-orange-600" onClick={addSpeakerHandle}>
                Add Speaker
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit Speaker Modal */}
      <div id="edit-speaker" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-hidden="true">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h4 className="text-xl font-semibold text-gray-900">Edit Speaker</h4>
            <button type="button" className="text-gray-500 hover:text-gray-700" onClick={closeEditSpeakerModal}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <form>
            <div className="p-4 pt-0">
              <div className="flex flex-wrap -mx-3">
                <div className="w-full px-3">
                  <SpeakerUpload speaker={selectedSpeaker} setSpeaker={setSelectedSpeaker} />
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={selectedSpeaker?.speakerName || ""}
                      onChange={(e) => setSelectedSpeaker({ ...selectedSpeaker, speakerName: e.target.value })}
                    />
                  </div>
                  {empty.speakerName && <p className="text-red-500 text-sm">{empty.speakerName}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={selectedSpeaker?.speakerEmail || ""}
                      onChange={(e) => setSelectedSpeaker({ ...selectedSpeaker, speakerEmail: e.target.value })}
                    />
                  </div>
                  {empty.speakerEmail && <p className="text-red-500 text-sm">{empty.speakerEmail}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={selectedSpeaker?.speakerPhone || ""}
                      onChange={(e) => setSelectedSpeaker({ ...selectedSpeaker, speakerPhone: e.target.value })}
                    />
                  </div>
                  {empty.speakerPhone && <p className="text-red-500 text-sm">{empty.speakerPhone}</p>}
                </div>
                
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Description <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={selectedSpeaker?.speakerDesc || ""}
                      onChange={(e) => setSelectedSpeaker({ ...selectedSpeaker, speakerDesc: e.target.value })}
                    />
                  </div>
                  {empty.speakerDesc && <p className="text-red-500 text-sm">{empty.speakerDesc}</p>}
                </div>
                

              </div>
            </div>
            <div className="flex items-center justify-end p-4 border-t border-gray-200">
              <button type="button" className="px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-200 rounded hover:bg-gray-300" onClick={closeEditSpeakerModal}>
                Cancel
              </button>
              <button type="submit" className="ml-2 px-3 py-2 text-sm font-semibold text-white bg-orange-500 rounded hover:bg-orange-600" onClick={editSpeakerHandle}>
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Speaker Detail Modal */}
      <div id="speaker-detail" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-hidden="true">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h4 className="text-xl font-semibold text-gray-900">Speaker Detail</h4>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => document.getElementById("speaker-detail").classList.add("hidden")}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="p-4">
            {selectedSpeaker ? (
              <>
                <div className="p-4">
                  <div className="flex justify-between items-center p-4 rounded-lg bg-gray-100">
                    <div className="flex items-center">
                      <a href="#" className="w-8 h-8 rounded-full border border-gray-200 mr-2">
                        <img src={selectedSpeaker.speakerImage || uploadImg} className="w-[70%] h-[70%]" alt="img" />
                      </a>
                      <div>
                        <p className="text-gray-900 font-medium mb-0">{selectedSpeaker.speakerName}</p>
                        <p>{selectedSpeaker.speakerEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-900 font-medium">Basic Info</p>
                  <div className="pb-1 border-b border-gray-200 mb-6">
                    <div className="flex flex-wrap -mx-3">
                      <div className="w-full md:w-1/3 px-3 mb-4">
                        <p className="text-xs mb-0">Phone Number</p>
                        <p className="text-gray-900">{selectedSpeaker.speakerPhone}</p>
                      </div>
                      <div className="w-full md:w-1/3 px-3 mb-4">
                        <p className="text-xs mb-0">Biography</p>
                        <p className="text-gray-900">{selectedSpeaker.speakerDesc}</p>
                      </div>
                      <div className="w-full md:w-1/3 px-3 mb-4">
                        <p className="text-xs mb-0">Experience</p>
                        <p className="text-gray-900">{selectedSpeaker.speakerExperience}</p>
                      </div>
                      <div className="w-full md:w-1/3 px-3 mb-4">
                        <p className="text-xs mb-0">Social Media</p>
                        <p className="text-gray-900" style={{ whiteSpace: "pre-line" }}>
                          {selectedSpeaker.speakerSocialMedia}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between mb-4">
        <div className="my-auto">
          <h2 className="text-2xl font-bold text-gray-900">Speaker</h2>
          <nav aria-label="breadcrumb">
            <ol className="flex flex-wrap list-none rounded-md">
              <li className="flex items-center">
                <a href="#" className="text-blue-500 hover:text-blue-700">Dashboard</a>
              </li>
              <li className="flex items-center before:content-['/'] before:px-2 before:text-gray-500 text-gray-500 pointer-events-none">
                Speaker
              </li>
            </ol>
          </nav>
        </div>
        <div className="flex gap-2">
          <div className="relative inline-block mr-4 z-10">
            <button
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded text-sm"
              onClick={toggleDropdownExport}
            >
              <i className="ti ti-file-export mr-1"></i> Export
            </button>
            {isOpenExport && (
              <ul className="absolute top-full right-0 bg-white border border-gray-300 rounded w-40 mt-1 shadow-lg">
                {["Export as PDF", "Export as Excel"].map((option) => (
                  <li
                    key={option}
                    onClick={() => handleExport(option)}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-orange-500"
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <a
              href="#"
              className="inline-block px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded hover:bg-orange-600"
              onClick={() => {
                document.getElementById("add-speaker").classList.remove("hidden");
                document.body.classList.add("overflow-hidden");
              }}
            >
              <i className="ti ti-circle-plus mr-2"></i> Add Speaker
            </a>
          </div>
        </div>
      </div>

      

      <div className="bg-white rounded border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h5 className="text-base font-semibold text-gray-900">Speaker List</h5>

        </div>
        <div className="flex flex-wrap items-center justify-between p-4">
          <div className="flex items-center">
            <label className="flex items-center text-sm text-gray-800">
              Round Per page
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="mx-2 border border-gray-200 rounded text-sm bg-white appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundSize: "1.25rem",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.5rem center",
                  paddingRight: "2rem",
                }}
              >
                {[10, 25, 50, 100].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              Entries
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="search"
              className="p-2 border border-gray-300 rounded text-sm"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Speaker Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {currentSpeakers.map((speaker, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-2 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-7 h-7 rounded-full overflow-hidden mr-2">
                        <img
                          src={speaker.speakerImage}
                          alt={speaker.speakerName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <a href="#" className="text-gray-900 hover:text-orange-500">
                        {speaker.speakerName}
                      </a>
                    </div>
                  </td>
                  <td className="p-2 border-b border-gray-200">{speaker.speakerEmail}</td>
                  <td className="p-2 border-b border-gray-200">{speaker.speakerPhone}</td>
                  <td className="p-2 border-b border-gray-200">{speaker.speakerDesc}</td>
                  <td className="p-2 border-b border-gray-200">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-2 bg-red-100 rounded"
                        onClick={() => {
                          setSelectedSpeaker(speaker);
                          document.getElementById("speaker-detail").classList.remove("hidden");
                        }}
                      >
                        <i className="ti ti-eye"></i>
                      </button>
                      <button
                        className="px-3 py-2 bg-teal-100 text-teal-600 rounded"
                        onClick={() => {
                          setSelectedSpeaker(speaker);
                          document.getElementById("edit-speaker").classList.remove("hidden");
                          document.body.classList.add("overflow-hidden");
                        }}
                      >
                        <i className="ti ti-pencil"></i>
                      </button>
                      <button
                        className="px-3 py-2 bg-red-100 text-red-600 rounded"
                        onClick={() => handleDeleteSpeaker(speaker)}
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap justify-between p-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} - {endIndex} of {filteredSpeakers.length} entries
          </div>
          <div className="flex gap-2">
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-900 hover:bg-gray-200 disabled:opacity-50"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <i className="ti ti-chevron-left"></i>
            </button>
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-500 text-white">{currentPage}</span>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-900 hover:bg-gray-200 disabled:opacity-50"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <i className="ti ti-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Speaker;
