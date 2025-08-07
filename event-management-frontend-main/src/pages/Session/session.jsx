import React, { useState, useRef, useEffect } from "react";
import "./session.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import "jspdf-autotable";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../../fonts/Times New Roman";
const Session = () => {


  const [isOpenExport, setIsOpenExport] = useState(false);
  const [isOpenLevel, setIsOpenLevel] = useState(false);

  const dropdownExportRef = useRef(null);
  const dropdownLevelRef = useRef(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const levelClass = {
    Confirmed: { class: "bg-confirmed", icon: "ti ti-circle-check" },
    Pending: { class: "bg-pending", icon: "ti ti-clock-hour-4" },
    Rejected: { class: "bg-rejected", icon: "ti ti-circle-dashed-x" },
  };
  const [speakers, setSpeakers] = useState([
    {
      "speaker_id": "1",
      "speaker_name": "Nguyễn Văn A",
      "speaker_photo": "https://smarthr.dreamstechnologies.com/laravel/template/public/build/img/profiles/avatar-30.jpg",
      "speaker_email": "nguyenvana@gmail.com",
      "speaker_phone": "0123456789",

      "speaker_biography": "Nguyễn Văn A là chuyên gia trong lĩnh vực AI và đã diễn thuyết tại nhiều hội nghị công nghệ lớn.",
      "speaker_topic": "Trí tuệ nhân tạo trong kỷ nguyên mới",
      "speaker_experience": "10 năm kinh nghiệm trong ngành AI",
      "speaker_social_media": [
        "linkedin: https://linkedin.com/in/nguyenvana",
        "twitter: https://twitter.com/nguyenvana"
      ],
      "speaker_status": "Confirmed",
      "speaker_presentation_date": "18/03/2025",
      "speaker_presentation_time": "10:00 AM - 11:30 AM",
      "speaker_presentation_materials": [
        "slides_ai_presentation.pdf",
        "ai_trends_2025.docx"
      ]
    },
    {
      "speaker_id": "2",
      "speaker_name": "Nguyễn Văn A",
      "speaker_photo": "https://smarthr.dreamstechnologies.com/laravel/template/public/build/img/profiles/avatar-30.jpg",
      "speaker_email": "nguyenvana@gmail.com",
      "speaker_phone": "0123456789",

      "speaker_biography": "Nguyễn Văn A là chuyên gia trong lĩnh vực AI và đã diễn thuyết tại nhiều hội nghị công nghệ lớn.",
      "speaker_topic": "Trí tuệ nhân tạo trong kỷ nguyên mới",
      "speaker_experience": "10 năm kinh nghiệm trong ngành AI",
      "speaker_social_media": [
        "linkedin: https://linkedin.com/in/nguyenvana",
        "twitter: https://twitter.com/nguyenvana"
      ]
      ,
      "speaker_status": "Pending",
      "speaker_presentation_date": "18/03/2025",
      "speaker_presentation_time": "10:00 AM - 11:30 AM",
      "speaker_presentation_materials": [
        "slides_ai_presentation.pdf",
        "ai_trends_2025.docx"
      ]
    },
    {
      "speaker_id": "3",
      "speaker_name": "Nguyễn Văn A",
      "speaker_photo": "https://smarthr.dreamstechnologies.com/laravel/template/public/build/img/profiles/avatar-30.jpg",
      "speaker_email": "nguyenvana@gmail.com",
      "speaker_phone": "0123456789",
      "speaker_biography": "Nguyễn Văn A là chuyên gia trong lĩnh vực AI và đã diễn thuyết tại nhiều hội nghị công nghệ lớn.",
      "speaker_topic": "Trí tuệ nhân tạo trong kỷ nguyên mới",
      "speaker_experience": "10 năm kinh nghiệm trong ngành AI",
      "speaker_social_media": [
        "linkedin: https://linkedin.com/in/nguyenvana",
        "twitter: https://twitter.com/nguyenvana"
      ],
      "speaker_status": "Rejected",
      "speaker_presentation_date": "18/03/2025",
      "speaker_presentation_time": "10:00 AM - 11:30 AM",
      "speaker_presentation_materials": [
        "slides_ai_presentation.pdf",
        "ai_trends_2025.docx"
      ]
    },
  ]);
  const [sessions, setSessions] = useState([
    {
      "session_id": "1",
      "session_speaker_name": "Nguyễn Văn A",
      "session_topic": "Trí tuệ nhân tạo trong kỷ nguyên mới",
      "session_photo": "https://smarthr.dreamstechnologies.com/laravel/template/public/build/img/profiles/avatar-30.jpg",
      "session_presentation_time": ["18/03/2025 10:00 AM - 11:30 AM", "19/03/2025 14:00 AM - 15:00 AM", "20/03/2025 10:00 AM - 11:30 AM"],
      "session_presentation_materials": [
        "slides_ai_presentation.pdf",
        "ai_trends_2025.docx"
      ],
      "session_status": "Upcoming"
    },
    {
      "session_id": "1",
      "session_speaker_name": "Nguyễn Văn A",
      "session_topic": "Trí tuệ nhân tạo trong kỷ nguyên mới",
      "session_photo": "https://smarthr.dreamstechnologies.com/laravel/template/public/build/img/profiles/avatar-30.jpg",
      "session_presentation_time": ["18/03/2025 10:00 AM - 11:30 AM", "19/03/2025 14:00 AM - 15:00 AM", "20/03/2025 10:00 AM - 11:30 AM"],
      "session_presentation_materials": [
        "slides_ai_presentation.pdf",
        "ai_trends_2025.docx"
      ],
      "session_status": "Live"
    },
    {
      "session_id": "1",
      "session_speaker_name": "Nguyễn Văn A",
      "session_topic": "Trí tuệ nhân tạo trong kỷ nguyên mới",
      "session_photo": "https://smarthr.dreamstechnologies.com/laravel/template/public/build/img/profiles/avatar-30.jpg",
      "session_presentation_time": ["18/03/2025 10:00 AM - 11:30 AM", "19/03/2025 14:00 AM - 15:00 AM", "20/03/2025 10:00 AM - 11:30 AM"],
      "session_presentation_materials": [
        "slides_ai_presentation.pdf",
        "ai_trends_2025.docx"
      ],
      "session_status": "Completed"
    },
  ]);
  const [newSession, setNewSession] = useState([
    {
      "session_id": "",
      "session_speaker_name": "",
      "session_topic": "",
      "session_photo": "",
      "session_presentation_time": [],
      "session_presentation_materials": [],
      "session_status": ""
    }
  ])
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFont("Times New Roman");
    doc.addFont('Times New Roman.ttf', 'Times New Roman', 'normal');
    doc.text("Session List", 14, 10);

    const tableColumn = ["Name", "Level", "Email", "Contact", "Phone", "Website"];
    const tableRows = sessions.map((session) => [
      session.session_speaker_name,
      session.session_level,
      session.session_email,
      session.session_contact,
      session.session_tel,
      session.session_website,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("session_list.pdf");
  };
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(sessions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sessions");

    // Xuất file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, "session_list.xlsx");
  };


  const handleExport = (option) => {
    if (option === "Export as PDF") {
      exportToPDF();
    } else if (option === "Export as Excel") {
      exportToExcel();
    }
    setIsOpenExport(false);
  };
  const handleDeleteSession = (selectedSession) => {
    const updatedSessions = sessions.filter(session => session.session_id !== selectedSession.session_id);
    setSessions(updatedSessions);
    setSelectedSession(null);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalPages = Math.ceil(sessions.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, sessions.length);
  const currentSessions = sessions.slice(startIndex, endIndex);
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };
  // Xử lý mở/đóng dropdown Export
  const toggleDropdownExport = () => {
    setIsOpenExport(!isOpenExport);
    setIsOpenLevel(false); // Đóng dropdown khác nếu đang mở
  };

  // Xử lý mở/đóng dropdown Level
  const toggleDropdownLevel = () => {
    setIsOpenLevel(!isOpenLevel);
    setIsOpenExport(false); // Đóng dropdown khác nếu đang mở
  };

  // Xử lý chọn Export


  // Xử lý chọn Level


  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownExportRef.current &&
        !dropdownExportRef.current.contains(event.target)
      ) {
        setIsOpenExport(false);
      }
      if (
        dropdownLevelRef.current &&
        !dropdownLevelRef.current.contains(event.target)
      ) {
        setIsOpenLevel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [dateTimes, setDateTimes] = useState([{ date: "", startTime: "", endTime: "" }]);


  // Hàm thêm input datetime-local
  const handleDateTimeChange = (index, field, value) => {
    const newDateTimes = [...dateTimes];
    newDateTimes[index][field] = value;
    setDateTimes(newDateTimes);
  };

  // Thêm một dòng mới
  const addDateTime = () => {
    setDateTimes([...dateTimes, { date: "", startTime: "", endTime: "" }]);
  };

  // Xóa dòng
  const removeDateTime = (index) => {
    setDateTimes(dateTimes.filter((_, i) => i !== index));
  };
  const addSessionHandle = (e) => {
    e.preventDefault();

    // Cập nhật thông tin speaker
    const updatedSession = {
        ...newSession,
        session_speaker_name: selectedSpeaker?.speaker_name || "",
        session_photo: selectedSpeaker?.speaker_photo || "",
        session_presentation_time: dateTimes.map(dt => 
            `${new Date(dt.date).toLocaleDateString("vi-VN")} ${dt.startTime} - ${dt.endTime}`
        )
    };

    // Cập nhật danh sách session
    setSessions([...sessions, updatedSession]);

    

    // Reset form
    setNewSession({
        session_topic: "",
        session_status: "",
        session_speaker_name: "",
        session_photo: "",
        session_presentation_time: []
    });
    setDateTimes([]); // Xóa danh sách thời gian đã chọn

    // Đóng modal
    document.querySelector("#add-session .btn-close").click();
};

  return (
    <div className="session-container">
      <div className="modal fade" id="add-session" tabindex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg" >
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add New Session</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form>
              <div className="modal-body">
                <div className="row">

                  {/* Form input */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="form-group">
                        <label className="form-label">Topic <span className="required">*</span></label>
                        <input type="email" className="input-field" onChange={(e) =>
                          setNewSession({ ...newSession, session_topic: e.target.value })
                        } />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="form-group">
                        <label className="form-label">Status<span className="required">*</span></label>
                        <select
                          className="input-field"
                          value={newSession.session_status}
                          onChange={(e) =>
                            setNewSession({ ...newSession, session_status: e.target.value })
                          }
                        >
                          <option value="">-- Select Status --</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <div className="form-group">
                        <label className="form-label">Presentation Time<span className="required">*</span></label>
                        <div className="input-datetime-picker">
                          {dateTimes.map((dateTime, index) => (
                            <div key={index} style={{ marginBottom: "10px" }}>
                              <input
                                type="date"
                                value={dateTime.date}
                                onChange={(e) => handleDateTimeChange(index, "date", e.target.value)}
                                className="mr-6"
                              />
                              <input
                                type="time"
                                value={dateTime.startTime}
                                onChange={(e) => handleDateTimeChange(index, "startTime", e.target.value)}
                                className="mr-6"
                              />
                              <input
                                type="time"
                                value={dateTime.endTime}
                                onChange={(e) => handleDateTimeChange(index, "endTime", e.target.value)}
                              />
                              <button type="button" className="ml-2 px-3 py-1 rounded hover:bg-gray-300" onClick={() => removeDateTime(index)} style={{ marginLeft: "10px" }}>
                                <i class="ti ti-backspace text-red-500 [font-size:16px]"></i> Remove
                              </button>
                            </div>
                          ))}
                          <button type="button" className="mb-1 px-3 py-1 rounded hover:bg-gray-300" onClick={addDateTime}><i class="ti ti-copy-plus text-blue-500"></i> Add Date & Time</button>

                          <h4>Selected Date & Time List:</h4>
                          <ul>
                            {dateTimes.map((dateTime, index) => (
                              dateTime.date && dateTime.startTime && dateTime.endTime && (
                                <li key={index}>
                                  {new Date(dateTime.date).toLocaleDateString("vi-VN")} {dateTime.startTime} - {dateTime.endTime}
                                </li>
                              )
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn cancel-btn" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary" onClick={addSessionHandle}>Add Session</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal fade" id="edit-session" tabindex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg" >
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Session</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form>
              <div className="modal-body">
                <div className="row">
                  {/* Avatar và upload */}
                  <div className="col-md-12">
                    <div className="avatar-container d-flex justify-center">
                      <div className="custom-avatar">
                        <img src={selectedSession?.session_photo || ""} alt="img" />
                      </div>                      
                    </div>
                  </div>

                  {/* Form input */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="form-group">
                        <label className="form-label">Name <span className="required">*</span></label>
                        <input type="email" className="input-field" value={selectedSession?.session_speaker_name || ""} disabled/>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="form-group">
                        <label className="form-label">Topic <span className="required">*</span></label>
                        <input type="email" className="input-field" value={selectedSession?.session_topic || ""} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="form-group">
                        <label className="form-label">Presentation Time<span className="required">*</span></label>
                        <textarea
                          className="input-field"
                          value={selectedSession?.session_presentation_time?.join("\n") || ""}
                          onChange={(e) => {
                            const updateSession = e.target.value.split("\n"); // Chuyển từng dòng thành mảng
                            setSelectedSpeaker((prev) => ({
                              ...prev,
                              session_presentation_time: updateSession
                            }));
                          }}
                          style={{ whiteSpace: "pre-line", minHeight: "80px", width: "100%" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="form-group">
                        <label className="form-label">Status<span className="required">*</span></label>
                        <input type="text" className="input-field" value={selectedSession?.session_status || ""} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn cancel-btn" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal fade" id="choose-speaker" tabindex="-2" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg" >
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Choose speaker</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form>
              <div className="modal-body">
                <div className="row">
                  {speakers.map((speaker) => (
                    <div className="col-md-6 mb-3" key={speaker.speaker_id}>
                      <div
                        className={`speaker-card ${selectedSpeaker?.speaker_id === speaker.speaker_id ? "selected" : ""}`}
                        onClick={() => setSelectedSpeaker(speaker)}
                      >
                        <div className="custom-card-body">
                          <img
                            src={speaker.speaker_photo}
                            alt={speaker.speaker_name}
                            className="rounded-circle mb-3"

                          />
                          <div>
                            <h6 className="mb-1">{speaker.speaker_name}</h6>
                            <p className="text-muted small mb-0">{speaker.speaker_topic}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn cancel-btn" data-bs-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-session">Continue</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal fade" id="session-detail" tabindex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg" >
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Session detail</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="moday-body">
              {selectedSession ? (
                <>
                  <div className="p-3">
                    <div className="custom-body-header p-3">
                      <div className="file-name-icon">
                        <a href="#" className="custom-avatar-2">
                          <img src={selectedSession.session_photo} className="img-fluid" alt="img"></img>
                        </a>
                        <div>
                          <p className="custom-text mb-0">{selectedSession.session_speaker_name}</p>
                          <p>{selectedSession.session_email}</p>
                        </div>
                      </div>
                      <span className={`badge ${levelClass[selectedSession.session_status]?.class}`}>
                        <i className={levelClass[selectedSession.session_status]?.icon}></i>
                        {selectedSession.session_status}
                      </span>

                    </div>
                  </div>
                  <div className="p-3">
                    <p className="custom-text">Presentation detail</p>
                    <div>
                      <div className="row align-items-center">
                        <div className="col-md-4">
                          <div className="mb-3">
                            <p className="fs-12 mb-0">Speaker</p>
                            <p className="text-gray-9">{selectedSession.session_speaker_name}</p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <p className="fs-12 mb-0">Topic</p>
                            <p className="text-gray-9">{selectedSession.session_topic}</p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <p className="fs-12 mb-0">Time</p>
                            <p className="text-gray-9">{selectedSession.session_presentation_time?.join("\n") || ""}</p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <p className="fs-12 mb-0">Materials</p>
                            <p className="text-gray-9" style={{ whiteSpace: "pre-line" }}>
                              {selectedSession.session_presentation_materials?.join("\n") || ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (<p>No data available</p>)}
            </div>
          </div>
        </div>
      </div>

      <div className="page-breadcrumb">
        <div my-auto mb-2>
          <h2 className="container-title">Session</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="#">Dashboard</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Session
              </li>
            </ol>
          </nav>
        </div>
        <div className="export-add-session">
          <div>
            <div className="custom-dropdown" ref={dropdownExportRef}>

              <button className="custom-dropdown-toggle" onClick={toggleDropdownExport}>
                <i className="ti ti-file-export me-1"></i> Export
              </button>
              {isOpenExport && (
                <ul className="custom-dropdown-menu">
                  {["Export as PDF", "Export as Excel"].map((option) => (
                    <li key={option} onClick={() => handleExport(option)}>
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
          <div className="mb-2">
            <a href="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#choose-speaker">
              <i className="ti ti-circle-plus me-2"></i> Add Session
            </a>
          </div>

        </div>

      </div>
      <div className="card">
        <div className="card-header">
          <h5>
            Session List
          </h5>

        </div>
        <div className="row table-length-filter">
          <div className="col-custom">
            <div className="dataTables_length" id="DataTables_Table_0_length">
              <label>
                Round Per page <select value={rowsPerPage} onChange={handleRowsPerPageChange} name="DataTables_Table_0_length" aria-controls="DataTables_Table_0" className="form-select form-select-sm">
                  {[10, 25, 50, 100].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                Entries
              </label>
            </div>
          </div>
          <div className="col-custom">
            <div className="dataTables_filter">
              <label>
                <input type="search" className="form-control form-control-sm" placeholder="Search" aria-controls="DataTables_Table_0"></input>
              </label>
            </div>
          </div>
        </div>
        <div className="col-sm-12 table-responsive">
          <table className="table table-hover">
            <thead className="thead-light">
              <tr>
                <th>Name</th>
                <th>Topic</th>
                <th>Materials</th>
                <th>Presentation time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentSessions.map((session, index) => (
                <tr key={index}>
                  <td>
                    <div className="avt-name">
                      <div className="avatar">
                        <img
                          src={session.session_photo}
                          className="img-fluid"
                          style={{ width: "28px", height: "28px", objectFit: "cover" }}
                        />
                      </div>
                      <div className="ms-2">
                        <a href="#">
                          <h6>{session.session_speaker_name}</h6>
                        </a>
                      </div>
                    </div>
                  </td>
                  <td>{session.session_topic}</td>
                  <td style={{ whiteSpace: "pre-line" }}>{session.session_presentation_materials?.join("\n") || ""}</td>
                  <td style={{ whiteSpace: "pre-line" }}>{session.session_presentation_time?.join("\n") || ""}</td>
                  <td>
                    <div className="table-action">
                      <button className="btn btn-detail" data-bs-toggle="modal" data-bs-target="#session-detail" onClick={() => setSelectedSession(session)} >
                        <i className="ti ti-eye"></i>
                      </button>

                      <button className="btn btn-edit" data-bs-toggle="modal" data-bs-target="#edit-session" onClick={() => setSelectedSession(session)}>
                        <i className="ti ti-pencil"></i>
                      </button>
                      <button className="btn btn-delete" onClick={() => handleDeleteSession(session)}>
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row table-info-paginate">
          <div className="col-custom">
            <div className="dataTables_info" id="DataTables_Table_0_info">
              Showing {startIndex + 1} - {endIndex} of {sessions.length} entries
            </div>
          </div>
          <div className="col-custom">
            <div className="dataTables_paginate paging_numbers" id="DataTables_Table_0_paginate">
              <ul className="pagination">
                <li className="paginate_button">
                  <button className="page-link"
                    onClick={handlePrevPage} disabled={currentPage === 1}>
                    <i className="ti ti-chevron-left" style={{ opacity: `${currentPage === 1 ? "0.5" : "1"}`, fontWeight: "600" }}></i>
                  </button>
                </li>
                <li className="paginate_button page-item active">
                  <a aria-controls="DataTables_Table_0" role="link" aria-current="page" data-dt-idx="0" tabindex="0" className="page-link">{currentPage}</a>
                </li>
                <li className="paginate_button">
                  <button className="page-link"
                    onClick={handleNextPage} disabled={currentPage === totalPages}>
                    <i className="ti ti-chevron-right" style={{ opacity: `${currentPage === totalPages ? "0.5" : "1"}`, fontWeight: "600" }}></i>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session;
