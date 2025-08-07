import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Swal from 'sweetalert2';
import { IoMusicalNote } from "react-icons/io5";
import { GrWorkshop } from "react-icons/gr";
import { FaGlassCheers } from "react-icons/fa";
import { MdOutlineSchema } from "react-icons/md";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { useTranslation } from "react-i18next";

const images = [
  "https://cdn.evbstatic.com/s3-build/fe/build/images/08f04c907aeb48f79070fd4ca0a584f9-citybrowse_desktop.webp",
  "https://cdn.evbstatic.com/s3-build/fe/build/images/0205288125d365f93edf9b62837de839-nightlife_desktop.webp",
  "https://cdn.evbstatic.com/s3-build/fe/build/images/389ece7b7e2dc7ff8d28524bad30d52c-dsrp_desktop.webp",
  "https://cdn.evbstatic.com/s3-build/fe/build/images/389ece7b7e2dc7ff8d28524bad30d52c-dsrp_desktop.webp",
];

const defaultCategories = [
  { icon: "fas fa-microphone-alt", label: "conference" },
  { icon: "fas fa-glass-martini-alt", label: "nightlife" },
  { icon: "fas fa-theater-masks", label: "performing" },
  { icon: "fas fa-sun", label: "holidays" },
  { icon: "fas fa-heart", label: "dating" },
  { icon: "fas fa-gamepad", label: "hobbies" },
  { icon: "fas fa-briefcase", label: "business" },
  { icon: "fas fa-utensils", label: "foodAndDrink" },
];

const reactIconsMap = {
  music: <IoMusicalNote className="text-xl sm:text-2xl text-gray-600 group-hover:text-[#3d64ff]" />,
  workshop: <GrWorkshop className="text-xl sm:text-2xl text-gray-600 group-hover:text-[#3d64ff]" />,
  schema: <MdOutlineSchema className="text-xl sm:text-2xl text-gray-600 group-hover:text-[#3d64ff]" />,
  party: <FaGlassCheers className="text-xl sm:text-2xl text-gray-600 group-hover:text-[#3d64ff]" />,
  default: <BiSolidCategoryAlt className="text-xl sm:text-2xl text-gray-600 group-hover:text-[#3d64ff]" />,
};

// Utility function to format label (e.g., capitalize first letter)
const formatLabel = (label) => {
  if (!label) return "Unknown";
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
};

const CategoriesGrid = ({ categories }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleSearchByCategory = async (categoryName) => {
    try {
      categoryName = categoryName.trim().toLowerCase();
      const response = await fetch(
        `http://localhost:8080/api/events/search/by-type/${categoryName}`
      );
      if (!response.ok) {
        throw new Error(t("sliderEvent.errorFetchEvents"));
      }
      const events = await response.json();
      navigate(`/list-event-search-by/${categoryName}`, {
        state: { events, categoryName },
      });
    } catch (error) {
      console.error('Error fetching event data:', error);
      Swal.fire({
        icon: 'error',
        title: t('sliderEvent.errorFetchEvents'),
        text: t('sliderEvent.errorFetchEvents'),
      });
    }
  };

  // Helper function to get translated or fallback label
  const getCategoryLabel = (label) => {
    const translationKey = `sliderEvent.${label.toLowerCase()}`;
    const translated = t(translationKey);
    // If translation is the same as the key, it means the key is missing
    if (translated === translationKey) {
      console.warn(`Missing translation for: ${translationKey}`);
      return formatLabel(label); // Fallback to formatted label
    }
    return translated;
  };

  return (
    <div className="py-4 my-8 sm:my-10 lg:my-12">
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={16}
        slidesPerView={2}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={600} 
        cssMode={false}
        easing="ease-out"
        navigation={false}
        loop={categories.length > 8}
        breakpoints={{
          640: { slidesPerView: 4, spaceBetween: 20 },
          1024: { slidesPerView: 8, spaceBetween: 24 },
        }}
        className="w-full"
        style={{
          '--swiper-transition-timing-function': 'ease-out',
        }}
      >
        {categories.map((category, index) => (
          <SwiperSlide key={index}>
            <div
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleSearchByCategory(category.label)}
            >
              <div className="w-20 sm:w-24 lg:w-[108px] h-20 sm:h-24 lg:h-[108px] rounded-full border-2 border-gray-100 flex items-center justify-center hover:border-[#74CEF7] transition-all duration-300">
                {category.iconType === 'font-awesome' ? (
                  <i className={`${category.icon} text-xl sm:text-2xl text-gray-600 group-hover:text-[#3d64ff]`}></i>
                ) : (
                  category.icon
                )}
              </div>
              <p className="mt-1 sm:mt-2 text-gray-600 group-hover:text-[#3d64ff] text-xs sm:text-sm lg:text-base text-center">
                {getCategoryLabel(category.label)}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

const SliderEvent = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/events-type/get-all-event-types');
        if (!response.ok) {
          throw new Error(t('sliderEvent.errorFetchTypes'));
        }
        const eventTypes = await response.json();

        const mappedCategories = eventTypes.map((type) => {
          const matchedCategory = defaultCategories.find(
            (cat) => cat.label.toLowerCase() === type.typeName.toLowerCase()
          );
          if (matchedCategory) {
            return {
              ...matchedCategory,
              iconType: 'font-awesome',
            };
          }
          return {
            label: type.typeName,
            icon: reactIconsMap[type.typeName.toLowerCase()] || reactIconsMap.default,
            iconType: 'react',
          };
        });

        setCategories(mappedCategories);
      } catch (error) {
        console.error('Error fetching event types:', error);
        Swal.fire({
          icon: 'error',
          title: t('sliderEvent.errorFetchTypes'),
          text: t('sliderEvent.errorFetchTypes'),
        });
        setCategories(defaultCategories);
      }
    };

    fetchEventTypes();
  }, [t]);

  return (
    <div className="w-full max-w-[1300px] mx-auto my-4 sm:my-5 lg:my-[20px] font-roboto">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={10}
        slidesPerView={1}
        navigation={false}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}
        className="overflow-hidden shadow-lg rounded-xl"
      >
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <img
              src={src}
              alt={`Slide ${index + 1}`}
              className="w-full h-[200px] sm:h-[300px] lg:h-[400px] object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <CategoriesGrid categories={categories} />
    </div>
  );
};

export default SliderEvent;