import React, { useState, useEffect } from "react";
import HeroSection from "../sections/HeroSection";
import SearchHotel from "./SearchHotel";
import FeaturedRoomsSection from "../sections/FeaturedRoomsSection";
import WhyChooseSection from "../sections/WhyChooseSection";
import TestimonialsSection from "../sections/TestimonialsSection";
import DestinationsSection from "../sections/DestinationsSection";
import { getAllHotels, getAllStayEaseFeedbacks, getAllRoomsByHotelId } from "../services/apiService";

const HomePage = () => {
  const [homeData, setHomeData] = useState({
    hotels: [],
    feedbacks: [],
    rooms: [],
    loading: true,
  });

  useEffect(() => {
    const fetchAllData = async () => {
      let hotelsArray = [];
      let feedbacksArray = [];
      let roomsData = [];

      try {
        const [hotelsRes, feedbacksRes] = await Promise.allSettled([
          getAllHotels(),
          getAllStayEaseFeedbacks(),
        ]);

        if (hotelsRes.status === "fulfilled" && hotelsRes.value?.status < 400) {
          const hotelsData = hotelsRes.value?.data?.data || hotelsRes.value?.data || [];
          hotelsArray = Array.isArray(hotelsData) ? hotelsData.filter((h) => h && h.id) : [];
        } else if (hotelsRes.status === "rejected") {
          console.error("Error fetching hotels:", hotelsRes.reason);
        }

        if (feedbacksRes.status === "fulfilled" && feedbacksRes.value?.status < 400) {
          const feedbacksData = feedbacksRes.value?.data?.data ?? feedbacksRes.value?.data ?? [];
          feedbacksArray = Array.isArray(feedbacksData) ? feedbacksData : [];
          console.log("Feedbacks loaded:", feedbacksArray.length);
        } else {
          if (feedbacksRes.status === "rejected") {
            console.error("Error fetching feedbacks:", feedbacksRes.reason);
          } else if (feedbacksRes.value?.status >= 400) {
            console.error("Feedbacks API error:", feedbacksRes.value?.status, feedbacksRes.value?.data);
          }
        }

        if (hotelsArray.length > 0) {
          const validHotels = hotelsArray.slice(0, 20);
          const roomPromises = validHotels.map(async (hotel) => {
            try {
              const roomRes = await getAllRoomsByHotelId(hotel.id);
              if (roomRes?.status >= 400) {
                return { hotel, rooms: [] };
              }
              const payload = roomRes?.data?.data || roomRes?.data || [];
              const roomsArray = Array.isArray(payload) ? payload : [];
              return { hotel, rooms: roomsArray };
            } catch {
              return { hotel, rooms: [] };
            }
          });

          const roomResults = await Promise.allSettled(roomPromises);
          roomsData = roomResults
            .filter((result) => result.status === "fulfilled" && result.value && result.value.rooms && result.value.rooms.length > 0)
            .map((result) => result.value);
        }
      } catch (error) {
      } finally {
        setHomeData({
          hotels: hotelsArray,
          feedbacks: feedbacksArray,
          rooms: roomsData,
          loading: false,
        });
      }
    };

    fetchAllData();
  }, []);

  return (
    <div>
      <HeroSection feedbacks={homeData.feedbacks} />
      <SearchHotel />
      <FeaturedRoomsSection hotels={homeData.hotels} roomsData={homeData.rooms} />
      <WhyChooseSection />
      <TestimonialsSection feedbacks={homeData.feedbacks} />
      <DestinationsSection hotels={homeData.hotels} />
    </div>
  );
};

export default HomePage;