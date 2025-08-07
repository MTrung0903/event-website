import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { PiArmchairLight } from "react-icons/pi";
import Swal from "sweetalert2";
import * as htmlToImage from "html-to-image";

const SeatingLayoutEditor = ({
  isOpen,
  onClose,
  venueType,
  onSave,
  availableTickets = [],
  seatingLayout,
}) => {
  const [layout, setLayout] = useState([
    {
      id: "stage",
      type: "stage",
      x: 50,
      y: 20,
      width: 300,
      height: 100,
      color: "#f87171",
    },
  ]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const containerRef = useRef(null);
  const hasValidSeating = areas.some((area) => area.type === "seating" && area.ticketId);

  useEffect(() => {
    if (seatingLayout) {
      // Tải lại bố cục từ seatingLayout
      const { stage, seatingAreas } = seatingLayout;
      const updatedSeatingAreas = seatingAreas.map((area, index) => ({
        id: area.id || `area-${Date.now() + index}`,
        type: area.type || "seating",
        x: area.x || 50 + index * 10, // Thêm mới: Đảm bảo tọa độ x
        y: area.y || 150 + index * 10, // Thêm mới: Đảm bảo tọa độ y
        width: area.width || 200, // Thêm mới: Đảm bảo kích thước
        height: area.height || 200, // Thêm mới: Đảm bảo kích thước
        name: area.name || "",
        capacity: area.capacity || 0,
        price: area.price || 0,
        ticketId: area.ticketId || null,
        color: area.color || "#3b82f6",
      }));

      setLayout([
        {
          ...stage,
          x: stage.x || 50,
          y: stage.y || 20,
          width: stage.width || 300,
          height: stage.height || 100,
          color: stage.color || "#f87171",
        },
        ...updatedSeatingAreas,
      ]);
      setAreas(
        updatedSeatingAreas.map((area) => ({
          id: area.id,
          name: area.name,
          capacity: area.capacity,
          price: area.price,
          type: area.type,
          ticketId: area.ticketId,
          areaId: area.id,
          color: area.color,
        }))
      );
    } else if (!areas.some((area) => area.type === "seating")) {
      const defaultArea = {
        id: `area-${Date.now()}`,
        type: "seating",
        x: 50,
        y: 150,
        width: 200,
        height: 200,
        name: "",
        capacity: 0,
        price: 0,
        ticketId: null,
        color: "#3b82f6",
      };
      setLayout([...layout, defaultArea]);
      setAreas([
        {
          id: defaultArea.id,
          name: defaultArea.name,
          capacity: defaultArea.capacity,
          price: defaultArea.price,
          type: defaultArea.type,
          ticketId: null,
          areaId: defaultArea.id,
          color: defaultArea.color,
        },
      ]);
    }
  }, [seatingLayout]);

  const addSeatingArea = () => {
    try {
      const newAreaId = `area-${Date.now()}`;
      const newArea = {
        id: newAreaId,
        type: "seating",
        x: 50,
        y: 150,
        width: 200,
        height: 200,
        name: "",
        capacity: 0,
        price: 0,
        ticketId: null,
        color: "#3b82f6",
      };
      setLayout([...layout, newArea]);
      setAreas([
        ...areas,
        {
          id: newAreaId,
          name: newArea.name,
          capacity: newArea.capacity,
          price: newArea.price,
          type: newArea.type,
          ticketId: null,
          areaId: newAreaId,
          color: newArea.color,
        },
      ]);
    } catch (error) {
      console.error("Lỗi khi thêm khu vực chỗ ngồi:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể thêm khu vực chỗ ngồi. Vui lòng thử lại.",
      });
    }
  };

const updateAreaDetails = (id, updates) => {
  try {
    const ticket = updates.ticketId
      ? availableTickets.find((t) => t.ticketId === updates.ticketId)
      : null;
    const updatedDetails = ticket
      ? {
          ticketId: ticket.ticketId, // Giữ nguyên ticketId từ availableTickets
          name: ticket.ticketName || "",
          capacity: parseInt(ticket.quantity) || 0,
          price: ticket.ticketType === "Paid" ? parseFloat(ticket.price) || 0 : 0,
          color: updates.color || areas.find((a) => a.id === id)?.color || "#3b82f6",
        }
      : {
          ticketId: null,
          name: "",
          capacity: 0,
          price: 0,
          color: updates.color || areas.find((a) => a.id === id)?.color || "#3b82f6",
        };

    setAreas(
      areas.map((area) =>
        area.id === id ? { ...area, ...updatedDetails, areaId: area.areaId || id } : area
      )
    );
    setLayout(
      layout.map((item) =>
        item.id === id ? { ...item, ...updatedDetails } : item
      )
    );
  } catch (error) {
    console.error("Lỗi khi cập nhật chi tiết khu vực:", error);
    Swal.fire({
      icon: "error",
      title: "Lỗi",
      text: "Không thể cập nhật chi tiết khu vực. Vui lòng thử lại.",
    });
  }
};

  const deleteArea = (id) => {
    try {
      if (id === "stage") {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể xóa sân khấu.",
        });
        return;
      }
      setLayout(layout.filter((item) => item.id !== id));
      setAreas(areas.filter((area) => area.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa khu vực:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể xóa khu vực. Vui lòng thử lại.",
      });
    }
  };

  const generateSeatingMapImage = async () => {
    if (containerRef.current) {
      try {
        const icons = containerRef.current.querySelectorAll(".area-icon");
        icons.forEach((icon) => (icon.style.display = "none"));

        const dataUrl = await htmlToImage.toPng(containerRef.current, {
          quality: 0.8,
          pixelRatio: 1,
          backgroundColor: "#f9fafb",
          cacheBust: true,
        });

        icons.forEach((icon) => (icon.style.display = "block"));
        return dataUrl;
      } catch (error) {
        console.error("Lỗi khi tạo ảnh bố cục:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể tạo ảnh bố cục. Vui lòng thử lại.",
        });
        return null;
      }
    }
    return null;
  };

  const handleSave = async () => {
    try {
      if (!hasValidSeating) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Vui lòng gán ít nhất một vé cho khu vực chỗ ngồi.",
        });
        return;
      }
      const image = await generateSeatingMapImage();
      if (image) {
        onSave({
          image,
          layout: {
            stage: layout.find((item) => item.type === "stage"),
            seatingAreas: areas.map((area) => ({
              ...area,
              x: layout.find((item) => item.id === area.id)?.x || 50,
              y: layout.find((item) => item.id === area.id)?.y || 150,
              width: layout.find((item) => item.id === area.id)?.width || 200,
              height: layout.find((item) => item.id === area.id)?.height || 200,
            })),
          },
        });
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể tạo ảnh bố cục. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Lỗi khi lưu bố cục:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể lưu bố cục. Vui lòng thử lại.",
      });
    }
  };

  const renderChairs = (area) => {
    if (area.type !== "seating") return null;
    const areaDetails = areas.find((a) => a.id === area.id) || { capacity: 0 };
    const capacity = areaDetails.capacity;
    const iconSize = 24;
    const padding = 4;
    const maxIcons = 10;
    const displayCount = Math.min(capacity, maxIcons);

    const icons = [];
    for (let i = 0; i < displayCount; i++) {
      icons.push(
        <PiArmchairLight
          key={i}
          className="text-gray-600"
          style={{ width: iconSize, height: iconSize, margin: padding / 2 }}
        />
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: padding,
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        {icons}
        {capacity > maxIcons && (
          <span className="text-sm font-semibold text-gray-800">
            +{capacity - maxIcons}
          </span>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 text-2xl font-bold">Tạo bố cục chỗ ngồi</h2>
        {!hasValidSeating && (
          <p className="mb-4 text-red-500">
            Vui lòng gán ít nhất một vé cho khu vực chỗ ngồi
          </p>
        )}
        <div
          ref={containerRef}
          className="relative w-full h-[500px] border border-gray-300 rounded-lg bg-gray-50 overflow-hidden"
        >
          {layout.map((item) => (
            <Rnd
              key={item.id}
              size={{ width: item.width, height: item.height }}
              position={{ x: item.x, y: item.y }}
              onDragStop={(e, d) => {
                setLayout(
                  layout.map((l) =>
                    l.id === item.id ? { ...l, x: d.x, y: d.y } : l
                  )
                );
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                setLayout(
                  layout.map((l) =>
                    l.id === item.id
                      ? {
                          ...l,
                          width: ref.offsetWidth,
                          height: ref.offsetHeight,
                          x: position.x,
                          y: position.y,
                        }
                      : l
                  )
                );
              }}
              bounds="parent"
              minWidth={50}
              minHeight={50}
              className={`border ${
                item.type === "stage" ? "border-red-500" : "border-blue-500"
              } rounded-lg flex items-center justify-center`}
              style={{
                backgroundColor:
                  item.color || (item.type === "stage" ? "#f87171" : "#3b82f6"),
              }}
            >
              <div className="relative flex flex-col items-center justify-center w-full h-full p-2">
                <span className="text-sm font-semibold text-white">
                  {item.type === "stage" ? "Sân khấu" : item.name || "Chưa gán"}
                </span>
                {item.type === "seating" && renderChairs(item)}
                {item.type === "seating" && (
                  <button
                    className="absolute text-red-500 area-icon top-1 right-1 hover:text-red-700"
                    onClick={() => deleteArea(item.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
                {item.type === "seating" && (
                  <button
                    className="absolute text-blue-500 area-icon top-1 left-1 hover:text-blue-700"
                    onClick={() => setSelectedArea(item.id)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                )}
              </div>
            </Rnd>
          ))}
        </div>

        {selectedArea && (
          <div className="p-4 mt-4 border rounded-lg bg-gray-50">
            <h3 className="mb-2 text-lg font-semibold">Gán vé cho khu vực</h3>
            {areas
              .filter((area) => area.id === selectedArea)
              .map((area) => (
                <div key={area.id} className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium">Chọn vé</label>
                    <select
                      value={area.ticketId || ""}
                      onChange={(e) =>
                        updateAreaDetails(area.id, { ticketId: e.target.value })
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Chọn một vé</option>
                      {availableTickets.map((ticket) => (
                        <option key={ticket.ticketId} value={ticket.ticketId}>
                          {ticket.ticketName} (
                          {ticket.ticketType === "Paid"
                            ? `${ticket.price} VND`
                            : "Miễn phí"}
                          )
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Chọn màu</label>
                    <input
                      type="color"
                      value={area.color || "#3b82f6"}
                      onChange={(e) =>
                        updateAreaDetails(area.id, { color: e.target.value })
                      }
                      className="w-full h-10 border rounded-md cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            <button
              className="px-4 py-2 mt-2 text-white bg-blue-500 rounded-lg"
              onClick={() => setSelectedArea(null)}
            >
              Đóng
            </button>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded-lg"
            onClick={addSeatingArea}
          >
            Thêm khu vực chỗ ngồi
          </button>
          <div>
            <button
              className="px-4 py-2 mr-2 text-gray-700 bg-gray-300 rounded-lg"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                hasValidSeating
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-700 cursor-not-allowed"
              }`}
              onClick={handleSave}
              disabled={!hasValidSeating}
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatingLayoutEditor;