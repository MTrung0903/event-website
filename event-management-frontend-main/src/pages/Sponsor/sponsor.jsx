import React, { useState, useRef, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import * as XLSX from 'xlsx';
import { pdf } from '@react-pdf/renderer';
import "../../fonts/Times New Roman";
import axios from "axios";
import { useParams } from "react-router-dom";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import SponsorPDFDocument from './SponsorPDFDocument';
import { toast } from 'react-toastify';
import uploadImg from '../../assets/image.png';
const Sponsor = () => {
  const { eventId } = useParams();
  const [selectedLevel, setSelectedLevel] = useState("");
  const [isOpenExport, setIsOpenExport] = useState(false);
  const [isOpenLevel, setIsOpenLevel] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [empty, setEmpty] = useState({});
  const dropdownExportRef = useRef(null);
  const dropdownLevelRef = useRef(null);
  const token = localStorage.getItem('token');
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState(null);
  const [existingSponsors, setExistingSponsors] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSponsors, setTotalSponsors] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sponsorToDelete, setSponsorToDelete] = useState(null);
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

  const levelClass = {
    Diamond: { class: "bg-cyan-400 text-white", icon: "ti ti-diamond" },
    Gold: { class: "bg-yellow-400 text-white", icon: "ti ti-coins" },
    Silver: { class: "bg-gray-400 text-white", icon: "ti ti-coins" },
  };

  const initialSponsorState = {
    sponsorId: "",
    sponsorName: "",
    sponsorLogoFile: "",
    sponsorLogo: "",
    sponsorEmail: "",
    sponsorAddress: "",
    sponsorLevel: "",
    sponsorRepresentativeName: "",
    sponsorRepresentativePosition: "",
    sponsorRepresentativeEmail: "",
    sponsorRepresentativePhone: "",
    sponsorPhone: "",
    sponsorWebsite: "",
    sponsorType: "",
    sponsorStatus: "",
    sponsorStartDate: "",
    sponsorEndDate: "",
  };

  const [sponsors, setSponsors] = useState([]);
  const [newSponsor, setNewSponsor] = useState(initialSponsorState);
  const currentSponsors = sponsors;

  const fetchSponsors = async (page = 1, size = rowsPerPage, search = searchTerm, level = selectedLevel) => {
    try {
      const params = new URLSearchParams({
        page: page - 1, // Backend sử dụng page bắt đầu từ 0
        size,
        ...(search && { search }), // Chỉ thêm search nếu có giá trị
        ...(level && { level })    // Chỉ thêm level nếu có giá trị
      });
      const response = await axios.get(`http://localhost:8080/api/v1/myevent/${eventId}/sponsor?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSponsors(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
      setTotalSponsors(response.data.data.totalElements);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Can't get the list of sponsors!";
      setToastMessage(errorMessage);
      setToastType("error");
    }
  };

  const fetchExistingSponsors = async () => {
    let userId;
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        userId = decodedPayload.userId;
      } catch (e) {
        return;
      }
    } else {
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/${userId}/sponsor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExistingSponsors(response.data.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch existing sponsors!';
      setToastMessage(errorMessage);
      setToastType('error');
    }
  };

  useEffect(() => {
    fetchSponsors();
    fetchExistingSponsors();
  }, []);


  const diamondSponsors = Array.isArray(sponsors) ? sponsors.filter(sponsor => sponsor.sponsorLevel === "Diamond").length : 0;
  const goldSponsors = Array.isArray(sponsors) ? sponsors.filter(sponsor => sponsor.sponsorLevel === "Gold").length : 0;
  const silverSponsors = Array.isArray(sponsors) ? sponsors.filter(sponsor => sponsor.sponsorLevel === "Silver").length : 0;

  const toggleDropdownExport = () => {
    setIsOpenExport(!isOpenExport);
    setIsOpenLevel(false);
  };

  const toggleDropdownLevel = () => {
    setIsOpenLevel(!isOpenLevel);
    setIsOpenExport(false);
  };

  const handleLevel = (option) => {
    const newLevel = option === "All Levels" ? "" : option;
    setSelectedLevel(newLevel);
    setCurrentPage(1);
    fetchSponsors(1, rowsPerPage, searchTerm, newLevel);
    setIsOpenLevel(false);
  };
  const handleSearch = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
    fetchSponsors(1, rowsPerPage, newSearchTerm, selectedLevel);
  };
  const checkInput = (sponsor, newEmpty) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0[1-9][0-9]{8}|84[1-9][0-9]{8})$/;
    const websiteRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d{1,5})?(\/.*)?$/;

    if (!sponsor.sponsorName?.trim()) newEmpty.sponsorName = "Please fill in field.";
    if (!sponsor.sponsorEmail?.trim()) {
      newEmpty.sponsorEmail = "Please fill in field.";
    } else if (!emailRegex.test(sponsor.sponsorEmail)) {
      newEmpty.sponsorEmail = "Invalid email.";
    }
    if (!sponsor.sponsorRepresentativeName?.trim()) newEmpty.sponsorRepresentativeName = "Please fill in field.";
    if (!sponsor.sponsorRepresentativeEmail?.trim()) {
      newEmpty.sponsorRepresentativeEmail = "Please fill in field.";
    } else if (!emailRegex.test(sponsor.sponsorRepresentativeEmail)) {
      newEmpty.sponsorRepresentativeEmail = "Invalid email.";
    }
    if (!sponsor.sponsorRepresentativePhone?.trim()) {
      newEmpty.sponsorRepresentativePhone = "Please fill in field.";
    } else if (!phoneRegex.test(sponsor.sponsorRepresentativePhone)) {
      newEmpty.sponsorRepresentativePhone = "Invalid Phone.";
    }
    if (!sponsor.sponsorRepresentativePosition?.trim()) newEmpty.sponsorRepresentativePosition = "Please fill in field.";
    if (!sponsor.sponsorAddress?.trim()) newEmpty.sponsorAddress = "Please fill in field.";
    if (!sponsor.sponsorPhone?.trim()) {
      newEmpty.sponsorPhone = "Please fill in field.";
    } else if (!phoneRegex.test(sponsor.sponsorPhone)) {
      newEmpty.sponsorPhone = "Invalid Phone.";
    }
    if (!sponsor.sponsorWebsite?.trim()) {
      newEmpty.sponsorWebsite = "Please fill in field.";
    } else if (!websiteRegex.test(sponsor.sponsorWebsite)) {
      newEmpty.sponsorWebsite = "Invalid website.";
    }
  };

  const addSponsorHandle = async (e) => {
    e.preventDefault();
    let newEmpty = {};
    checkInput(newSponsor, newEmpty);
    if (Object.keys(newEmpty).length > 0) {
      setEmpty(newEmpty);
      return;
    }
    const formData = new FormData();
    Object.entries(newSponsor).forEach(([key, value]) => {
      if (value) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value);
        }
      }
    });
    try {
      const response = await axios.post(
        `http://localhost:8080/api/v1/myevent/${eventId}/sponsor`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setToastMessage(response.data.msg);
      setToastType("success");
      setNewSponsor(initialSponsorState); // Reset form
      setEmpty({});
      document.querySelector("#add-sponsor [data-dismiss='modal']").click();
      fetchSponsors(); // Refresh sponsor list
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Can't process sponsor!";
      setToastMessage(errorMessage);
      setToastType("error");
    }
  };

  const addExistingSponsor = (sponsor) => {
    setNewSponsor({
      sponsorId: sponsor.sponsorId || "",
      sponsorName: sponsor.sponsorName || "",
      sponsorLogoFile: "",
      sponsorLogo: sponsor.sponsorLogo || "",
      sponsorEmail: sponsor.sponsorEmail || "",
      sponsorAddress: sponsor.sponsorAddress || "",
      sponsorLevel: sponsor.sponsorLevel || "",
      sponsorRepresentativeName: sponsor.sponsorRepresentativeName || "",
      sponsorRepresentativePosition: sponsor.sponsorRepresentativePosition || "",
      sponsorRepresentativeEmail: sponsor.sponsorRepresentativeEmail || "",
      sponsorRepresentativePhone: sponsor.sponsorRepresentativePhone || "",
      sponsorPhone: sponsor.sponsorPhone || "",
      sponsorWebsite: sponsor.sponsorWebsite || "",
      sponsorType: sponsor.sponsorType || "",
      sponsorStatus: sponsor.sponsorStatus || "",
      sponsorStartDate: sponsor.sponsorStartDate || "",
      sponsorEndDate: sponsor.sponsorEndDate || "",
    });
    document.querySelector('#existing-sponsors [data-dismiss="modal"]').click();
    const addSponsorModalElement = document.getElementById('add-sponsor');
    addSponsorModalElement.classList.add('block');
    addSponsorModalElement.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  };

  const editSponsorHandle = async (e) => {
    e.preventDefault();
    let newEmpty = {};
    checkInput(selectedSponsor, newEmpty);
    if (Object.keys(newEmpty).length > 0) {
      setEmpty(newEmpty);
      return;
    }
    const formData = new FormData();
    Object.entries(selectedSponsor).forEach(([key, value]) => {
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
        `http://localhost:8080/api/v1/myevent/${eventId}/sponsor/${selectedSponsor.sponsorId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.statusCode === "1" || response.data.statusCode === 1) {
        setToastMessage(response.data.msg);
        setToastType("success");
        setSponsors((prevSponsors) =>
          prevSponsors.map((sponsor) =>
            sponsor.sponsorId === selectedSponsor.sponsorId ? selectedSponsor : sponsor
          )
        );
        setSelectedSponsor(null); // Reset form
        setEmpty({});
        document.querySelector("#edit-sponsor [data-dismiss='modal']").click();
      } else {
        setToastMessage(response.data.msg);
        setToastType("error");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Can't get the list of sponsors!";
      setToastMessage(errorMessage);
      setToastType("error");
    }
  };

  const handleDeleteSponsor = async (selectedSponsor) => {
    setSponsorToDelete(selectedSponsor);
    setShowDeleteConfirm(true);
  };
  const confirmDeleteSponsor = async () => {
    if (!sponsorToDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/v1/myevent/${eventId}/sponsor/${sponsorToDelete.sponsorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.statusCode === "1" || response.data.statusCode === 1) {
        setToastMessage(response.data.msg);
        setToastType("success");
      } else {
        setToastType("error");
        setToastMessage(response.data.msg);
      }
      const updatedSponsors = sponsors.filter(sponsor => sponsor.sponsorId !== sponsorToDelete.sponsorId);
      setSponsors(updatedSponsors);
      setSelectedSponsor(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Can't delete sponsor!";
      setToastType("error");
      setToastMessage(errorMessage);
    } finally {
      setShowDeleteConfirm(false);
      setSponsorToDelete(null);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handlePrevPage = () => {
    const newPage = Math.max(currentPage - 1, 1);
    setCurrentPage(newPage);
    fetchSponsors(newPage, rowsPerPage, searchTerm, selectedLevel);
  };

  const handleNextPage = () => {
    const newPage = Math.min(currentPage + 1, totalPages);
    setCurrentPage(newPage);
    fetchSponsors(newPage, rowsPerPage, searchTerm, selectedLevel);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchSponsors(1, newRowsPerPage, searchTerm, selectedLevel);
  };

  const exportToPDF = async () => {

    try {
      const doc = <SponsorPDFDocument sponsors={sponsors} />;
      const asPdf = pdf([]);
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      saveAs(blob, 'sponsor_list.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToastMessage('Failed to generate PDF');
      setToastType('error');
    }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sponsors');

    worksheet.columns = [
      { header: 'ID', key: 'sponsorId', width: 10 },
      { header: 'Name', key: 'sponsorName', width: 20 },
      { header: 'Email', key: 'sponsorEmail', width: 30 },
      { header: 'Phone', key: 'sponsorPhone', width: 15 },
      { header: 'Website', key: 'sponsorWebsite', width: 30 },
      { header: 'Address', key: 'sponsorAddress', width: 30 },
      { header: 'Level', key: 'sponsorLevel', width: 20 },
      { header: 'Representative Name', key: 'sponsorRepresentativeName', width: 30 },
      { header: 'Representative Position', key: 'sponsorRepresentativePosition', width: 20 },
      { header: 'Sponsor Type', key: 'sponsorType', width: 15 },
      { header: 'Amount', key: 'sponsorAmount', width: 20 },
      { header: 'Contribution', key: 'sponsorContribution', width: 20 },
      { header: 'Status', key: 'sponsorStatus', width: 15 },
    ];

    sponsors.forEach(s => {
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
    saveAs(blob, 'sponsors.xlsx');
  };

  const handleExport = (option) => {
    if (option === "Export as PDF") {
      exportToPDF();
    } else if (option === "Export as Excel") {
      exportToExcel();
    }
    setIsOpenExport(false);
  };

  const fileInputRef = useRef();
  const handleImport = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet);
        const sponsorsFile = rawData.map((item) => ({
          sponsorId: item["ID"],
          sponsorName: item["Name"],
          sponsorEmail: item["Email"],
          sponsorPhone: item["Phone"],
          sponsorWebsite: item["Website"],
          sponsorAddress: item["Address"],
          sponsorLevel: item["Level"],
          sponsorRepresentativeName: item["Representative Name"],
          sponsorRepresentativePosition: item["Representative Position"],
          sponsorType: item["Sponsor Type"],
          sponsorAmount: item["Amount"],
          sponsorContribution: item["Contribution"],
          sponsorStatus: item["Status"],
          sponsorStartDate: item["Start Date"],
          sponsorEndDate: item["End Date"],
        }));
        const response = await axios.post(
          `http://localhost:8080/api/v1/myevent/${eventId}/sponsors/import`,
          sponsorsFile,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.data.statusCode === 1 || response.data.statusCode === "1") {
          setToastMessage(response.data.msg);
          setToastType("success");
          fetchSponsors();
        } else {
          setToastMessage(response.data.msg);
          setToastType("error");
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Can't add sponsor to event!";
        setToastMessage(errorMessage);
        setToastType("error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownExportRef.current && !dropdownExportRef.current.contains(event.target)) {
        setIsOpenExport(false);
      }
      if (dropdownLevelRef.current && !dropdownLevelRef.current.contains(event.target)) {
        setIsOpenLevel(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeAddSponsorModal = () => {
    document.getElementById('add-sponsor').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    setNewSponsor(initialSponsorState);
    setEmpty({});
  };

  const closeEditSponsorModal = () => {
    document.getElementById('edit-sponsor').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    setSelectedSponsor(null);
    setEmpty({});
  };

  const SponsorUpload = ({ sponsor, setSponsor }) => {
    const fileInputRef = useRef(null);

    const handleButtonClick = () => fileInputRef.current.click();

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setSponsor((prev) => ({ ...prev, sponsorLogoFile: file }));
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setSponsor((prev) => ({ ...prev, sponsorLogo: reader.result }));
        };
      }
    };

    return (
      <div className="flex flex-wrap items-center gap-4 bg-gray-100 w-full rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center w-20 h-20 rounded-full border border-gray-300 overflow-hidden flex-shrink-0 mr-2 text-gray-800 font-bold">
          <img src={sponsor?.sponsorLogo || uploadImg} alt="Sponsor" className="w-[70%] h-[70%]" />
        </div>
        <div className="flex-1">
          <div className="text-base font-bold mb-2">Upload Sponsor Image</div>
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
            <a onClick={() => setSponsor((prev) => ({ ...prev, sponsorLogo: "" }))} className="text-sm bg-gray-200 rounded cursor-pointer text-gray-900 hover:bg-gray-300">Cancel</a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 text-gray-500 font-roboto text-sm">
      {/* Add Sponsor Modal */}
      <div id="add-sponsor" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-hidden="true">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h4 className="text-xl font-semibold text-gray-900">Add New Sponsor</h4>
            <button type="button" className="text-gray-500 hover:text-gray-700" data-dismiss="modal" aria-label="Close" onClick={closeAddSponsorModal}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <form>
            <div className="p-4 pt-0">
              <div className="flex flex-wrap -mx-3">
                <div className="w-full px-3">
                  <SponsorUpload sponsor={newSponsor} setSponsor={setNewSponsor} />
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={newSponsor.sponsorName}
                      onChange={(e) => setNewSponsor({ ...newSponsor, sponsorName: e.target.value })}
                    />
                  </div>
                  {empty.sponsorName && <p className="text-red-500 text-sm">{empty.sponsorName}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={newSponsor.sponsorEmail}
                      onChange={(e) => setNewSponsor({ ...newSponsor, sponsorEmail: e.target.value })}
                    />
                  </div>
                  {empty.sponsorEmail && <p className="text-red-500 text-sm">{empty.sponsorEmail}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Address <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={newSponsor.sponsorAddress}
                      onChange={(e) => setNewSponsor({ ...newSponsor, sponsorAddress: e.target.value })}
                    />
                  </div>
                  {empty.sponsorAddress && <p className="text-red-500 text-sm">{empty.sponsorAddress}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={newSponsor.sponsorPhone}
                      onChange={(e) => setNewSponsor({ ...newSponsor, sponsorPhone: e.target.value })}
                    />
                  </div>
                  {empty.sponsorPhone && <p className="text-red-500 text-sm">{empty.sponsorPhone}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Website <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={newSponsor.sponsorWebsite}
                      onChange={(e) => setNewSponsor({ ...newSponsor, sponsorWebsite: e.target.value })}
                    />
                  </div>
                  {empty.sponsorWebsite && <p className="text-red-500 text-sm">{empty.sponsorWebsite}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Represent Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={newSponsor.sponsorRepresentativeName}
                      onChange={(e) => setNewSponsor({ ...newSponsor, sponsorRepresentativeName: e.target.value })}
                    />
                  </div>
                  {empty.sponsorRepresentativeName && <p className="text-red-500 text-sm">{empty.sponsorRepresentativeName}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Represent Position <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={newSponsor.sponsorRepresentativePosition}
                      onChange={(e) => setNewSponsor({ ...newSponsor, sponsorRepresentativePosition: e.target.value })}
                    />
                  </div>
                  {empty.sponsorRepresentativePosition && <p className="text-red-500 text-sm">{empty.sponsorRepresentativePosition}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Represent Email <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={newSponsor.sponsorRepresentativeEmail}
                      onChange={(e) => setNewSponsor({ ...newSponsor, sponsorRepresentativeEmail: e.target.value })}
                    />
                  </div>
                  {empty.sponsorRepresentativeEmail && <p className="text-red-500 text-sm">{empty.sponsorRepresentativeEmail}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Represent Phone <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={newSponsor.sponsorRepresentativePhone}
                      onChange={(e) => setNewSponsor({ ...newSponsor, sponsorRepresentativePhone: e.target.value })}
                    />
                  </div>
                  {empty.sponsorRepresentativePhone && <p className="text-red-500 text-sm">{empty.sponsorRepresentativePhone}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Type <span className="text-red-500">*</span></label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={newSponsor.sponsorType}
                      onChange={(e) => setNewSponsor({ ...newSponsor, sponsorType: e.target.value })}
                    >
                      <option value="">-- Select Type --</option>
                      <option value="Financialive">Financial Sponsorship</option>
                      <option value="In-kind">In-kind Sponsorship</option>
                      <option value="Media">Media Sponsorship</option>
                      <option value="Promotional">Promotional Partners</option>
                    </select>
                  </div>
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Level <span className="text-red-500">*</span></label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={newSponsor.sponsorLevel}
                      onChange={(e) => setNewSponsor({ ...newSponsor, sponsorLevel: e.target.value })}
                    >
                      <option value="">-- Select Level --</option>
                      <option value="Diamond">Diamond</option>
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                    </select>
                  </div>
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Status <span className="text-red-500">*</span></label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={newSponsor.sponsorStatus}
                      onChange={(e) => setNewSponsor({ ...newSponsor, sponsorStatus: e.target.value })}
                    >
                      <option value="">-- Select Status --</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end p-4 border-t border-gray-200">
              <button type="button" className="px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-200 rounded hover:bg-gray-300" data-dismiss="modal" onClick={closeAddSponsorModal}>
                Cancel
              </button>
              <button type="submit" className="ml-2 px-3 py-2 text-sm font-semibold text-white bg-orange-500 rounded hover:bg-orange-600" onClick={addSponsorHandle}>
                Add Sponsor
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Existing Sponsors Modal */}
      <div id="existing-sponsors" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-hidden="true">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h4 className="text-xl font-semibold text-gray-900">Select Existing Sponsor</h4>
            <button type="button" className="text-gray-500 hover:text-gray-700" data-dismiss="modal" aria-label="Close" onClick={() => document.getElementById('existing-sponsors').classList.add('hidden')}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="p-4 max-h-[calc(80vh-120px)] overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 text-left">Sponsor Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Phone</th>
                    <th className="p-2 text-left">Website</th>
                    <th className="p-2 text-left">Address</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(existingSponsors) && existingSponsors.length > 0 ? (
                    existingSponsors.map((sponsor, index) => {
                      const isAdded = sponsors.some((s) => s.sponsorId === sponsor.sponsorId);
                      return (
                        <tr key={index} className={isAdded ? "opacity-60" : ""}>
                          <td className="p-2 border-b border-gray-200">{sponsor.sponsorName}</td>
                          <td className="p-2 border-b border-gray-200">{sponsor.sponsorEmail}</td>
                          <td className="p-2 border-b border-gray-200">{sponsor.sponsorPhone}</td>
                          <td className="p-2 border-b border-gray-200">{sponsor.sponsorWebsite}</td>
                          <td className="p-2 border-b border-gray-200">{sponsor.sponsorAddress}</td>
                          <td className="p-2 border-b border-gray-200">
                            {isAdded ? (
                              <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded">Already Added</span>
                            ) : (
                              <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-gray-500 rounded">Not Added</span>
                            )}
                          </td>
                          <td className="p-2 border-b border-gray-200">
                            <button
                              className="px-3 py-2 text-sm font-semibold text-white bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50"
                              onClick={() => addExistingSponsor(sponsor)}
                              disabled={isAdded}
                            >
                              Add to Event
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-2 border-b border-gray-200">
                        No existing sponsors found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-end p-4 border-t border-gray-200">
            <button type="button" className="px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-200 rounded hover:bg-gray-300" data-dismiss="modal" onClick={() => document.getElementById('existing-sponsors').classList.add('hidden')}>
              Cancel
            </button>
            <button
              type="button"
              className="ml-2 px-3 py-2 text-sm font-semibold text-white bg-orange-500 rounded hover:bg-orange-600"
              onClick={() => {
                document.getElementById('existing-sponsors').classList.add('hidden');
                document.getElementById('add-sponsor').classList.remove('hidden');
              }}
            >
              Create New Sponsor
            </button>
          </div>
        </div>
      </div>

      {/* Sponsor Detail Modal */}
      <div id="sponsor-detail" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-hidden="true">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h4 className="text-xl font-semibold text-gray-900">Sponsor Detail</h4>
            <button type="button" className="text-gray-500 hover:text-gray-700" data-dismiss="modal" aria-label="Close" onClick={() => document.getElementById('sponsor-detail').classList.add('hidden')}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="p-4">
            {selectedSponsor ? (
              <>
                <div className="p-4">
                  <div className="flex justify-between items-center p-4 rounded-lg bg-gray-100">
                    <div className="flex items-center">
                      <a href="#" className="w-8 h-8 rounded-full border border-gray-200 mr-2">
                        <img src={selectedSponsor?.sponsorLogo || uploadImg} className="w-[70%] h-[70%]" alt="img" />
                      </a>
                      <div>
                        <p className="text-gray-900 font-medium mb-0">{selectedSponsor.sponsorName}</p>
                        <p>{selectedSponsor.sponsorEmail}</p>
                      </div>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${levelClass[selectedSponsor.sponsorLevel]?.class}`}>
                      <i className={levelClass[selectedSponsor.sponsorLevel]?.icon}></i>
                      {selectedSponsor.sponsorLevel}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-900 font-medium">Basic Info</p>
                  <div className="pb-1 border-b border-gray-200 mb-6">
                    <div className="flex flex-wrap -mx-3">
                      <div className="w-full md:w-1/3 px-3 mb-4">
                        <p className="text-xs mb-0">Phone Number</p>
                        <p className="text-gray-900">{selectedSponsor.sponsorPhone}</p>
                      </div>
                      <div className="w-full md:w-1/3 px-3 mb-4">
                        <p className="text-xs mb-0">Website</p>
                        <p className="text-gray-900">{selectedSponsor.sponsorWebsite}</p>
                      </div>
                      <div className="w-full md:w-1/3 px-3 mb-4">
                        <p className="text-xs mb-0">Address</p>
                        <p className="text-gray-900">{selectedSponsor.sponsorAddress}</p>
                      </div>
                      <div className="w-full md:w-1/3 px-3 mb-4">
                        <p className="text-xs mb-0">Represent</p>
                        <p className="text-gray-900">{selectedSponsor.sponsorRepresentativeName}</p>
                      </div>
                      <div className="w-full md:w-1/3 px-3 mb-4">
                        <p className="text-xs mb-0">Represent Position</p>
                        <p className="text-gray-900">{selectedSponsor.sponsorRepresentativePosition}</p>
                      </div>
                      <div className="w-full md:w-1/3 px-3 mb-4">
                        <p className="text-xs mb-0">Represent Phone</p>
                        <p className="text-gray-900">{selectedSponsor.sponsorRepresentativePhone}</p>
                      </div>
                      <div className="w-full md:w-1/3 px-3 mb-4">
                        <p className="text-xs mb-0">Represent Email</p>
                        <p className="text-gray-900">{selectedSponsor.sponsorRepresentativeEmail}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-900 font-medium">Contract Detail</p>
                  <div>
                    <div className="flex flex-wrap -mx-3">
                      <div className="w-full md:w-1/3 px-3 mb-4">
                        <p className="text-xs mb-0">Status</p>
                        <p className="text-gray-900">{selectedSponsor.sponsorStatus}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (<p>No data available</p>)}
          </div>
        </div>
      </div>

      {/* Edit Sponsor Modal */}
      <div id="edit-sponsor" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-hidden="true">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h4 className="text-xl font-semibold text-gray-900">Edit Sponsor</h4>
            <button type="button" className="text-gray-500 hover:text-gray-700" data-dismiss="modal" aria-label="Close" onClick={closeEditSponsorModal}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <form>
            <div className="p-4 pt-0">
              <div className="flex flex-wrap -mx-3">
                <div className="w-full px-3">
                  <SponsorUpload sponsor={selectedSponsor} setSponsor={setSelectedSponsor} />
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={selectedSponsor?.sponsorName || ""}
                      onChange={(e) => setSelectedSponsor((prev) => ({ ...prev, sponsorName: e.target.value }))}
                    />
                  </div>
                  {empty.sponsorName && <p className="text-red-500 text-sm">{empty.sponsorName}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Email <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={selectedSponsor?.sponsorEmail || ""}
                      onChange={(e) => setSelectedSponsor((prev) => ({ ...prev, sponsorEmail: e.target.value }))}
                    />
                  </div>
                  {empty.sponsorEmail && <p className="text-red-500 text-sm">{empty.sponsorEmail}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Address <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={selectedSponsor?.sponsorAddress || ""}
                      onChange={(e) => setSelectedSponsor((prev) => ({ ...prev, sponsorAddress: e.target.value }))}
                    />
                  </div>
                  {empty.sponsorAddress && <p className="text-red-500 text-sm">{empty.sponsorAddress}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={selectedSponsor?.sponsorPhone || ""}
                      onChange={(e) => setSelectedSponsor((prev) => ({ ...prev, sponsorPhone: e.target.value }))}
                    />
                  </div>
                  {empty.sponsorPhone && <p className="text-red-500 text-sm">{empty.sponsorPhone}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Website <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={selectedSponsor?.sponsorWebsite || ""}
                      onChange={(e) => setSelectedSponsor((prev) => ({ ...prev, sponsorWebsite: e.target.value }))}
                    />
                  </div>
                  {empty.sponsorWebsite && <p className="text-red-500 text-sm">{empty.sponsorWebsite}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Represent Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={selectedSponsor?.sponsorRepresentativeName || ""}
                      onChange={(e) => setSelectedSponsor((prev) => ({ ...prev, sponsorRepresentativeName: e.target.value }))}
                    />
                  </div>
                  {empty.sponsorRepresentativeName && <p className="text-red-500 text-sm">{empty.sponsorRepresentativeName}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Represent Position <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={selectedSponsor?.sponsorRepresentativePosition || ""}
                      onChange={(e) => setSelectedSponsor((prev) => ({ ...prev, sponsorRepresentativePosition: e.target.value }))}
                    />
                  </div>
                  {empty.sponsorRepresentativePosition && <p className="text-red-500 text-sm">{empty.sponsorRepresentativePosition}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Represent Email <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={selectedSponsor?.sponsorRepresentativeEmail || ""}
                      onChange={(e) => setSelectedSponsor((prev) => ({ ...prev, sponsorRepresentativeEmail: e.target.value }))}
                    />
                  </div>
                  {empty.sponsorRepresentativeEmail && <p className="text-red-500 text-sm">{empty.sponsorRepresentativeEmail}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Represent Phone <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                      value={selectedSponsor?.sponsorRepresentativePhone || ""}
                      onChange={(e) => setSelectedSponsor((prev) => ({ ...prev, sponsorRepresentativePhone: e.target.value }))}
                    />
                  </div>
                  {empty.sponsorRepresentativePhone && <p className="text-red-500 text-sm">{empty.sponsorRepresentativePhone}</p>}
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Type <span className="text-red-500">*</span></label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={selectedSponsor?.sponsorType || ""}
                      onChange={(e) => setSelectedSponsor((prev) => ({ ...prev, sponsorType: e.target.value }))}
                    >
                      <option value="">-- Select Type --</option>
                      <option value="Financialive">Financial Sponsorship</option>
                      <option value="In-kind">In-kind Sponsorship</option>
                      <option value="Media">Media Sponsorship</option>
                      <option value="Promotional">Promotional Partners</option>
                    </select>
                  </div>
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Level <span className="text-red-500">*</span></label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={selectedSponsor?.sponsorLevel || ""}
                      onChange={(e) => setSelectedSponsor((prev) => ({ ...prev, sponsorLevel: e.target.value }))}
                    >
                      <option value="">-- Select Level --</option>
                      <option value="Diamond">Diamond</option>
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                    </select>
                  </div>
                </div>
                <div className="w-full md:w-1/2 px-3 mb-4">
                  <div className="form-group">
                    <label className="text-gray-900 text-sm font-normal">Status <span className="text-red-500">*</span></label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      value={selectedSponsor?.sponsorStatus || ""}
                      onChange={(e) => setSelectedSponsor((prev) => ({ ...prev, sponsorStatus: e.target.value }))}
                    >
                      <option value="">-- Select Status --</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end p-4 border-t border-gray-200">
              <button type="button" className="px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-200 rounded hover:bg-gray-300" data-dismiss="modal" onClick={closeEditSponsorModal}>
                Cancel
              </button>
              <button type="submit" className="ml-2 px-3 py-2 text-sm font-semibold text-white bg-orange-500 rounded hover:bg-orange-600" onClick={editSponsorHandle}>
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap justify-between mb-4">
        <div className="my-auto">
          <h2 className="text-2xl font-bold text-gray-900">Sponsor</h2>
          <nav aria-label="breadcrumb">
            <ol className="flex flex-wrap list-none rounded-md">
              <li className="flex items-center">
                <a href="#" className="text-blue-500 hover:text-blue-700">Dashboard</a>
              </li>
              <li className="flex items-center before:content-['/'] before:px-2 before:text-gray-500 text-gray-500 pointer-events-none">
                Sponsor
              </li>
            </ol>
          </nav>
        </div>
        <div className="flex gap-2">
          <div className="relative inline-block mr-4 z-10">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded text-sm" onClick={toggleDropdownExport}>
              <i className="ti ti-file-export mr-1"></i> Export
            </button>
            {isOpenExport && (
              <ul className="absolute top-full right-0 bg-white border border-gray-300 rounded w-40 mt-1 shadow-lg">
                {["Export as PDF", "Export as Excel"].map((option) => (
                  <li key={option} onClick={() => handleExport(option)} className="px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-orange-500">
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <a href="#" className="inline-block px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded hover:bg-orange-600" onClick={handleImport}>
              <i className="ti ti-file-arrow-left mr-2"></i> Import
            </a>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <a href="#" className="inline-block px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded hover:bg-orange-600" onClick={() => document.getElementById('existing-sponsors').classList.remove('hidden')}>
              <i className="ti ti-circle-plus mr-2"></i> Add Sponsor
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap -mx-3">
        <div className="w-full lg:w-1/4 md:w-1/2 px-3">
          <div className="flex flex-col bg-white rounded border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center">
                <span className="w-11 h-11 flex items-center justify-center rounded bg-orange-500 border border-orange-500 text-white text-base flex-shrink-0">
                  <i className="ti ti-building text-lg"></i>
                </span>
                <div className="ml-2">
                  <p className="text-xs font-medium">Total sponsors</p>
                  <h4 className="text-lg font-semibold text-gray-900">{totalSponsors}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/4 md:w-1/2 px-3">
          <div className="flex flex-col bg-white rounded border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center">
                <span className="w-11 h-11 flex items-center justify-center rounded bg-cyan-400 border border-cyan-400 text-white text-base flex-shrink-0">
                  <i className="ti ti-diamond"></i>
                </span>
                <div className="ml-2">
                  <p className="text-xs font-medium">Diamond</p>
                  <h4 className="text-lg font-semibold text-gray-900">{diamondSponsors}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/4 md:w-1/2 px-3">
          <div className="flex flex-col bg-white rounded border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center">
                <span className="w-11 h-11 flex items-center justify-center rounded bg-yellow-400 border border-yellow-400 text-white text-base flex-shrink-0">
                  <i className="ti ti-coins"></i>
                </span>
                <div className="ml-2">
                  <p className="text-xs font-medium">Gold</p>
                  <h4 className="text-lg font-semibold text-gray-900">{goldSponsors}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/4 md:w-1/2 px-3">
          <div className="flex flex-col bg-white rounded border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center">
                <span className="w-11 h-11 flex items-center justify-center rounded bg-gray-400 border border-gray-400 text-white text-base flex-shrink-0">
                  <i className="ti ti-coins"></i>
                </span>
                <div className="ml-2">
                  <p className="text-xs font-medium">Silver</p>
                  <h4 className="text-lg font-semibold text-gray-900">{silverSponsors}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h5 className="text-base font-semibold text-gray-900">Sponsor List</h5>
          <div className="relative inline-block z-10">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded text-sm" onClick={toggleDropdownLevel}>
              {selectedLevel === "" ? "All Levels" : selectedLevel}
            </button>
            {isOpenLevel && (
              <ul className="absolute top-full right-0 bg-white border border-gray-300 rounded w-40 mt-1 shadow-lg">
                {["All Levels", "Diamond", "Gold", "Silver"].map((option) => (
                  <li key={option} onClick={() => handleLevel(option)} className="px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-orange-500">
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
                  backgroundSize: '1.25rem',
                  backgroundPosition: 'right 0px center',
                  backgroundRepeat: 'no-repeat',
                  paddingRight: '20px',
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
            <label>
              <input
                type="search"
                value={searchTerm}
                className="text-xs p-1 border border-gray-200 rounded"
                placeholder="Search by sponsor name, email"
                onChange={handleSearch}
              />
            </label>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Sponsor name</th>
                <th className="p-2 text-left">Sponsorship Level</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Represent</th>
                <th className="p-2 text-left">Tel</th>
                <th className="p-2 text-left">Website</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(currentSponsors) && currentSponsors.map((sponsor, index) => (
                <tr key={index}>
                  <td className="p-2 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-7 h-7">
                        <img
                          src={sponsor.sponsorLogo}
                          alt={sponsor.sponsorName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="ml-2">
                        <a href="#" className="text-base font-semibold">{sponsor.sponsorName}</a>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 border-b border-gray-200">{sponsor.sponsorLevel}</td>
                  <td className="p-2 border-b border-gray-200">{sponsor.sponsorEmail}</td>
                  <td className="p-2 border-b border-gray-200">{sponsor.sponsorRepresentativeName}</td>
                  <td className="p-2 border-b border-gray-200">{sponsor.sponsorPhone}</td>
                  <td className="p-2 border-b border-gray-200">{sponsor.sponsorWebsite}</td>
                  <td className="p-2 border-b border-gray-200">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded ${sponsor.sponsorStatus === "Active" ? "bg-green-500" : "bg-red-500"}`}>
                      {sponsor.sponsorStatus}
                    </span>
                  </td>
                  <td className="p-2 border-b border-gray-200">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-2 bg-red-100 rounded"
                        onClick={() => {
                          setSelectedSponsor(sponsor);
                          document.getElementById('sponsor-detail').classList.remove('hidden');
                        }}
                      >
                        <i className="ti ti-eye"></i>
                      </button>
                      <button
                        className="px-3 py-2 bg-teal-100 text-teal-600 rounded"
                        onClick={() => {
                          setSelectedSponsor(sponsor);
                          document.getElementById('edit-sponsor').classList.remove('hidden');
                        }}
                      >
                        <i className="ti ti-pencil"></i>
                      </button>
                      <button
                        className="px-3 py-2 bg-red-100 text-red-600 rounded"
                        onClick={() => handleDeleteSponsor(sponsor)}
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
        <div className="flex items-center justify-between p-4">
          <div>
            Showing {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, totalSponsors)} of {totalSponsors} entries
          </div>
          <div className="flex gap-1 justify-end mr-4">
            <button
              className="w-6 h-6 flex items-center justify-center rounded-full bg-transparent text-gray-900"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? "0.5" : "1" }}
            >
              <i className="ti ti-chevron-left font-semibold"></i>
            </button>
            <a className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500 text-white">{currentPage}</a>
            <button
              className="w-6 h-6 flex items-center justify-center rounded-full bg-transparent text-gray-900"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={{ opacity: currentPage === totalPages ? "0.5" : "1" }}
            >
              <i className="ti ti-chevron-right font-semibold"></i>
            </button>
          </div>
        </div>
      </div>
      <div id="delete-confirm" className={`${showDeleteConfirm ? 'block' : 'hidden'} fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`} aria-hidden="true">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h4 className="text-xl font-semibold text-gray-900">Confirm Delete</h4>
            <button type="button" className="text-gray-500 hover:text-gray-700" onClick={() => setShowDeleteConfirm(false)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="p-4">
            <p className="text-gray-900">Are you sure you want to delete <strong>{sponsorToDelete?.sponsorName}</strong>? This action cannot be undone.</p>
          </div>
          <div className="flex items-center justify-end p-4 border-t border-gray-200">
            <button
              type="button"
              className="px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ml-2 px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded hover:bg-red-600"
              onClick={confirmDeleteSponsor}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

  );

};

export default Sponsor;