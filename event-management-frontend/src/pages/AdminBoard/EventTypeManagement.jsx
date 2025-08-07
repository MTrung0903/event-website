import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const EventTypeManagement = () => {
    const [allEventTypes, setAllEventTypes] = useState([]);
    const [eventTypes, setEventTypes] = useState([]);
    const [newTypeName, setNewTypeName] = useState("");
    const [editEventType, setEditEventType] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const token = localStorage.getItem("token");

    // Fetch all event types
    const fetchEventTypes = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/events-type/get-all-event-types", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            //console.log("Fetch event types response:", response.data);
            setAllEventTypes(response.data);
            setEventTypes(response.data);
            setCurrentPage(1);
        } catch (error) {
           // console.error("Fetch event types error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `Failed to load event types: ${error.response?.data?.msg || error.message}`,
            });
        } finally {
            setLoading(false);
        }
    };

    // Search event types on frontend
    const searchEventTypes = (types, term) => {
        if (!term.trim()) return types;
        return types.filter((type) =>
            type.typeName.toLowerCase().includes(term.toLowerCase())
        );
    };

    // Load event types on mount
    useEffect(() => {
        fetchEventTypes();
    }, []);

    // Filter event types when searchTerm changes
    useEffect(() => {
        const filtered = searchEventTypes(allEventTypes, searchTerm);
        setEventTypes(filtered);
        setCurrentPage(1);
    }, [searchTerm, allEventTypes]);

    // Handle add event type
    const handleAddEventType = async (e) => {
        e.preventDefault();
        if (!newTypeName.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: "Type name cannot be empty or contain only spaces",
            });
            return;
        }
        if (!token) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Authentication token is missing. Please log in.",
            });
            return;
        }

        setLoading(true);
        try {
            //console.log("Add event type - Token:", token);
            //console.log("Add event type - Request body:", { typeName: newTypeName });
            const response = await axios.post(
                "http://localhost:8080/api/events-type/create-types",
                { typeName: newTypeName },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            //console.log("Add event type - Response:", response.data);
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.msg || "Unknown error");
            }
            const newEventType = response.data.data;
            setAllEventTypes([...allEventTypes, newEventType]);
            setEventTypes([...eventTypes, newEventType]);
            setNewTypeName("");
            setSearchTerm("");
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Event type added successfully!",
            });
        } catch (error) {
           // console.error("Add event type - Error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `Failed to add event type: ${error.response?.data?.msg || error.message}`,
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle edit event type
    const handleEditEventType = async (e) => {
        e.preventDefault();
        if (!editEventType.typeName.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: "Type name cannot be empty or contain only spaces",
            });
            return;
        }

        setLoading(true);
        try {
           // console.log("Edit event type - Request body:", { typeName: editEventType.typeName });
            const response = await axios.put(
                `http://localhost:8080/api/events-type/${editEventType.id}`,
                { typeName: editEventType.typeName },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            //console.log("Edit event type - Response:", response.data);
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.msg || "Unknown error");
            }
            const updatedEventType = response.data.data;
            setAllEventTypes(
                allEventTypes.map((type) =>
                    type.id === editEventType.id ? updatedEventType : type
                )
            );
            setEventTypes(
                eventTypes.map((type) =>
                    type.id === editEventType.id ? updatedEventType : type
                )
            );
            setIsModalOpen(false);
            setEditEventType(null);
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Event type updated successfully!",
            });
        } catch (error) {
           // console.error("Edit event type - Error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `Failed to update event type: ${error.response?.data?.msg || error.message}`,
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle delete event type
    const handleDeleteEventType = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
               // console.log("Delete event type - ID:", id);
                await axios.delete(`http://localhost:8080/api/events-type/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAllEventTypes(allEventTypes.filter((type) => type.id !== id));
                setEventTypes(eventTypes.filter((type) => type.id !== id));
                setCurrentPage(1);
                Swal.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "Event type deleted successfully.",
                });
            } catch (error) {
                //console.error("Delete event type - Error:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `Failed to delete event type: ${error.response?.data?.msg || error.message}`,
                });
            } finally {
                setLoading(false);
            }
        }
    };

    // Open edit modal
    const openEditModal = (eventType) => {
        setEditEventType(eventType);
        setIsModalOpen(true);
    };

    // Close edit modal
    const closeEditModal = () => {
        setIsModalOpen(false);
        setEditEventType(null);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = eventTypes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(eventTypes.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="min-h-screen p-6 bg-gradient-to-b from-blue-50 to-white">
            <h1 className="mb-8 text-4xl font-extrabold text-center text-gray-800">
                Event Type Management
            </h1>

            {/* Search and Add Event Type Form */}
            <div className="max-w-3xl p-8 mx-auto mb-8 transition-all duration-300 bg-white shadow-lg rounded-2xl">
                <h2 className="mb-6 text-2xl font-semibold text-gray-700">Add New Event Type</h2>
                <form onSubmit={handleAddEventType} className="flex gap-4 mb-6">
                    <input
                        type="text"
                        value={newTypeName}
                        onChange={(e) => {
                            //console.log("Input value:", e.target.value);
                            setNewTypeName(e.target.value);
                        }}
                        placeholder="Enter type name"
                        className="flex-1 p-3 transition-all duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                    >
                        {loading ? (
                            <svg className="inline w-5 h-5 text-white animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                            </svg>
                        ) : (
                            "Add"
                        )}
                    </button>
                </form>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by type name"
                        className="flex-1 p-3 transition-all duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => setSearchTerm("")}
                        className="px-6 py-3 text-gray-700 transition-all duration-200 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Event Types Table */}
            <div className="max-w-5xl p-8 mx-auto bg-white shadow-lg rounded-2xl">
                <h2 className="mb-6 text-2xl font-semibold text-gray-700">Event Types List</h2>
                {loading ? (
                    <div className="text-center">
                        <svg className="w-8 h-8 mx-auto text-blue-600 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                        </svg>
                    </div>
                ) : eventTypes.length === 0 ? (
                    <div className="text-center text-gray-500">No event types found.</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-blue-100">
                                        <th className="p-4 font-semibold text-left text-gray-700">ID</th>
                                        <th className="p-4 font-semibold text-left text-gray-700">Type Name</th>
                                        <th className="p-4 font-semibold text-center text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((type) => (
                                        <tr key={type.id} className="transition-all duration-200 border-b hover:bg-gray-50">
                                            <td className="p-4">{type.id}</td>
                                            <td className="p-4">{type.typeName}</td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => openEditModal(type)}
                                                    className="mr-4 text-blue-600 transition-colors duration-200 hover:text-blue-800"
                                                    title="Edit"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEventType(type.id)}
                                                    className="text-red-600 transition-colors duration-200 hover:text-red-800"
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-gray-600">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, eventTypes.length)} of {eventTypes.length} entries
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => paginate(page)}
                                        className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                            currentPage === page
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-8 transition-all duration-300 transform scale-95 bg-white shadow-xl rounded-2xl animate-modal-open">
                        <h2 className="mb-6 text-2xl font-semibold text-gray-700">Edit Event Type</h2>
                        <form onSubmit={handleEditEventType}>
                            <div className="mb-6">
                                <label className="block mb-2 font-medium text-gray-700">Type Name</label>
                                <input
                                    type="text"
                                    value={editEventType?.typeName || ""}
                                    onChange={(e) =>
                                        setEditEventType({
                                            ...editEventType,
                                            typeName: e.target.value,
                                        })
                                    }
                                    className="w-full p-3 transition-all duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-6 py-3 text-gray-700 transition-all duration-200 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <svg className="inline w-5 h-5 text-white animate-spin" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                                        </svg>
                                    ) : (
                                        "Save"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventTypeManagement;