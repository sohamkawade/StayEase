import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Star, MapPin, Phone, Mail, Calendar, Users, Bed, Eye, Wifi, Car, Waves, Wind, Utensils, Tv, Coffee, MoveRight, Heart } from "lucide-react";
import { API_URL, getRoomByRoomId, getAllRoomsByHotelId, getHotelById, bookRoom, addToWishlist, getUserWishlist, removeFromWishlist, createPaymentOrder, verifyPayment, markPaymentFailed, cancelPayment } from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import { loadRazorpayScript } from "../utils/razorpayLoader";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [roomBundle, setRoomBundle] = useState(null);
  const [wishlistData, setWishlistData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomError, setRoomError] = useState(null);

  const { register, handleSubmit, watch, formState: { errors }, setError: setFormError } = useForm({
    defaultValues: { checkInDate: "", checkOutDate: "", totalGuests: 1, termsConsent: false },
  });

  const checkInDate = watch("checkInDate");
  const checkOutDate = watch("checkOutDate");

  const toAbsolute = (src = "") => (/^https?:\/\//i.test(src) ? src : `${new URL(API_URL).origin}${src.startsWith("/") ? src : `/${src}`}`);
  const formatImages = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) {
      return images.map((img) => {
        if (typeof img === 'string') return toAbsolute(img);
        return toAbsolute(img?.imageUrl || img?.url || "");
      }).filter(Boolean);
    }
    if (typeof images === 'string') {
      return [toAbsolute(images)];
    }
    if (images.imageUrl || images.url) {
      return [toAbsolute(images.imageUrl || images.url)];
    }
    return [];
  };
  const normalizeStatus = (status) => {
    const label = (status || "").toUpperCase();
    if (label === "BOOKED") return "Booked";
    if (label === "MAINTENANCE") return "Maintenance";
    return "Available";
  };

  const fetchRoom = async () => {
    if (location.state?.room) return { ...location.state.room, images: formatImages(location.state.room.images), hotelId: location.state.hotelId || location.state.room.hotelId };

    const response = await getRoomByRoomId(id);
    const roomData = response?.data?.data ?? response?.data;
    if (!roomData) throw new Error("Room not found");

    return {
      id: roomData.id,
      roomNumber: roomData.roomNumber,
      roomType: roomData.roomType,
      price: roomData.price,
      status: normalizeStatus(roomData.status),
      capacity: roomData.capacity,
      bedType: roomData.bedType,
      viewType: roomData.viewType,
      description: roomData.description,
      amenities: roomData.amenities || [],
      images: formatImages(roomData.images),
      hotelId: roomData.hotel?.id || location.state?.hotelId,
    };
  };

  const fetchHotel = async (hotelId) => {
    if (!hotelId) return null;
    const response = await getHotelById(hotelId);
    const hotelData = response?.data?.data ?? response?.data;
    if (!hotelData) return null;
    return {
      id: hotelData.id,
      hotelName: hotelData.hotelName,
      email: hotelData.email,
      contactNumber: hotelData.contactNumber,
      starRating: hotelData.starRating,
      description: hotelData.description,
      hotelImage: toAbsolute(hotelData.hotelImage),
      checkInTime: hotelData.checkInTime,
      checkOutTime: hotelData.checkOutTime,
      address: {
        streetAddress: hotelData.address?.streetAddress || "",
        city: hotelData.address?.city || "",
        state: hotelData.address?.state || "",
        pincode: hotelData.address?.pincode || "",
      },
    };
  };

  const fetchRelatedRooms = async (hotelId, currentRoomId) => {
    if (!hotelId) return [];
    const response = await getAllRoomsByHotelId(hotelId);
    return (response?.data?.data ?? response?.data ?? [])
      .filter((r) => r.id !== currentRoomId)
      .slice(0, 4)
      .map((r) => ({
        id: r.id,
        roomType: r.roomType,
        price: r.price,
        status: normalizeStatus(r.status),
        image: formatImages(r.images)[0] || "",
        capacity: r.capacity,
        bedType: r.bedType,
        rating: r.rating || 0.0,
      }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setRoomError(null);
      try {
        const roomData = await fetchRoom();
        let hotelData = null;
        let relatedRooms = [];

        if (roomData.hotelId) {
          const [hotelInfo, related] = await Promise.all([
            fetchHotel(roomData.hotelId),
            fetchRelatedRooms(roomData.hotelId, roomData.id),
          ]);
          hotelData = hotelInfo;
          relatedRooms = related;
        }

        setRoomBundle({ room: roomData, hotel: hotelData, relatedRooms });
      } catch (error) {
        setRoomError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, location]);

  const room = roomBundle?.room || null;
  const hotel = roomBundle?.hotel || null;

  const userId = user?.id || user?.userId;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setWishlistData([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const response = await getUserWishlist(userId);
        const data = response?.data?.data ?? response?.data ?? [];
        setWishlistData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch wishlist", error);
        setWishlistData([]);
      }
    };
    fetchWishlist();
  }, [isAuthenticated, userId]);

  const currentWishlistItem = useMemo(() => {
    if (!room?.id || !Array.isArray(wishlistData)) return null;
    return wishlistData.find((item) => {
      const itemRoomId = item?.room?.id || item?.roomId;
      return itemRoomId === room.id;
    });
  }, [wishlistData, room?.id]);

  const isInWishlist = !!currentWishlistItem;
  const wishlistItemId = currentWishlistItem?.id;

  const handleToggleWishlist = async () => {
    if (!isAuthenticated || !user || !room?.id) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const userId = user?.id || user?.userId;
    if (!userId) {
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist && wishlistItemId) {
        await removeFromWishlist(wishlistItemId);
      } else {
        await addToWishlist(userId, room.id);
      }
      const response = await getUserWishlist(userId);
      const data = response?.data?.data ?? response?.data ?? [];
      setWishlistData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!room) return;

    if (!isAuthenticated || !user) {
      toast.warning("Please login to book a room", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "#000000",
          color: "#ffffff",
        },
      });
      navigate("/login", { state: { from: location.pathname, bookingData: { room, hotel, ...data } } });
      return;
    }

    const userRole = user?.role || user?.roleName || "";
    const roleUpper = userRole?.toUpperCase();

    if (roleUpper !== "USER") {
      toast.warning("Only regular users can book rooms", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "#000000",
          color: "#ffffff",
        },
      });
      return;
    }

    if (room.capacity && data.totalGuests > room.capacity) {
      setFormError("totalGuests", { type: "manual", message: `Max ${room.capacity} guests allowed.` });
      return;
    }

    const storedUser = localStorage.getItem("user");
    const session = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

    try {
      const nights = checkInDate && checkOutDate && new Date(checkOutDate) > new Date(checkInDate)
        ? Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24))
        : 1;
      const totalAmount = room.price * nights;

      const bookingRes = await bookRoom(room.id, session.id || session.userId, data.totalGuests, data.checkInDate, data.checkOutDate);
      
      if (bookingRes?.status < 200 || bookingRes?.status >= 400) {
        throw new Error(bookingRes?.data?.message || "Failed to book room");
      }

      const booking = bookingRes?.data?.data || bookingRes?.data;
      const bookingId = booking?.id;

      if (!bookingId) {
        throw new Error("Booking ID not found in response");
      }

      const orderRes = await createPaymentOrder(bookingId, totalAmount, "INR");
      
      if (orderRes?.status < 200 || orderRes?.status >= 400) {
        throw new Error(orderRes?.data?.message || "Failed to create payment order");
      }

      const orderData = orderRes?.data?.data || orderRes?.data;

      const options = {
        key: orderData.keyId || "rzp_test_1DP5mmOlF5G5ag",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "StayEase Hotel Booking",
        description: `Payment for Room ${room.roomNumber} - ${room.roomType}`,
        handler: async function (response) {
          try {
            const verifyRes = await verifyPayment(
              bookingId,
              response.razorpay_order_id || orderData.orderId,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verifyRes?.status >= 200 && verifyRes?.status < 400) {
              toast.success("Payment successful! Booking confirmed.", {
                position: "top-center",
                autoClose: 3000,
              });
              navigate("/user/my-bookings", { state: { room, hotel, ...data } });
            } else {
              throw new Error(verifyRes?.data?.message || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            try {
              await markPaymentFailed(bookingId);
            } catch (deleteError) {
              console.error("Error deleting booking after verification failure:", deleteError);
            }
            toast.error(error?.response?.data?.message || error?.message || "Payment verification failed", {
              position: "top-center",
              autoClose: 5000,
            });
          }
        },
        prefill: {
          name: `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "Guest",
          email: user?.email || "",
          contact: user?.contactNumber || "",
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: async function () {
            try {
              await cancelPayment(bookingId);
              toast.info("Payment cancelled.", {
                position: "top-center",
                autoClose: 3000,
              });
            } catch (error) {
              console.error("Error cancelling payment:", error);
              toast.info("Payment cancelled", {
                position: "top-center",
                autoClose: 2000,
              });
            }
          },
        },
      };

      try {
        await loadRazorpayScript();
        
        if (window.Razorpay) {
          const razorpay = new window.Razorpay(options);          
          razorpay.on("payment.failed", async function (response) {
            try {
              await markPaymentFailed(bookingId);
              toast.error("Payment failed: " + (response.error.description || "Unknown error"), {
                position: "top-center",
                autoClose: 5000,
              });
            } catch (error) {
              console.error("Payment failure handling error:", error);
              toast.error("Payment failed: " + (response.error.description || "Unknown error"), {
                position: "top-center",
                autoClose: 5000,
              });
            }
          });

          razorpay.on("payment.error", async function (response) {
            try {
              await markPaymentFailed(bookingId);
              toast.error("Payment error: " + (response.error.description || "Unknown error"), {
                position: "top-center",
                autoClose: 5000,
              });
            } catch (error) {
              console.error("Payment error handling:", error);
              toast.error("Payment error: " + (response.error.description || "Unknown error"), {
                position: "top-center",
                autoClose: 5000,
              });
            }
          });

          razorpay.open();
        } else {
          throw new Error("Razorpay failed to load");
        }
      } catch (error) {
        console.error("Razorpay loading error:", error);
        toast.error("Failed to load payment gateway. Please check your Razorpay test keys.", {
          position: "top-center",
          autoClose: 5000,
        });
      }

    } catch (error) {
      console.error("Booking error:", error);
      setPageError(error?.response?.data?.message || error?.message || "Failed to book room. Please try again.");
      toast.error(error?.response?.data?.message || error?.message || "Failed to book room. Please try again.", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const amenityIcons = {
    wifi: Wifi,
    parking: Car,
    pool: Waves,
    ac: Wind,
    restaurant: Utensils,
    tv: Tv,
    coffee: Coffee,
  };

  const getAmenityIcon = (amenity) => {
    const lower = (amenity || "").toLowerCase();
    for (const [key, Icon] of Object.entries(amenityIcons)) {
      if (lower.includes(key)) return Icon;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="md:flex items-center justify-center flex-col mt-32 min-h-screen text-black overflow-hidden px-6 md:px-12 py-8">
        <div className="text-center py-12 text-gray-500">Loading room details...</div>
      </div>
    );
  }

  const loadErrorMessage = roomError?.message;

  if (loadErrorMessage || !room) {
    return (
      <div className="md:flex items-center justify-center flex-col mt-32 min-h-screen text-black overflow-hidden px-6 md:px-12 py-8">
        <div className="text-center py-12 text-red-600">{loadErrorMessage || "Room not found"}</div>
        <button
          onClick={() => navigate("/rooms")}
          className="mt-4 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          back to Rooms
        </button>
    </div>
    );
  }

  const statusDisplay = normalizeStatus(room.status);
  const isAvailable = statusDisplay === "Available";
  const nights = checkInDate && checkOutDate && new Date(checkOutDate) > new Date(checkInDate)
    ? Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <>      
      <div className="mt-28 min-h-screen text-black px-4 sm:px-6 lg:px-10 py-10">
        <div className="w-full max-w-6xl mx-auto">
          <h1 className="text-xl md:text-7xl uppercase tracking-widest text-black font-medium text-center mb-6">
            room details
          </h1>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[15px] mb-6 text-center">
          <Link to="/" className="text-gray-600 hover:text-black transition-colors">Home</Link>
          <MoveRight className="text-gray-500" size={15} />
          <Link to="/rooms" className="text-gray-600 hover:text-black transition-colors">Rooms</Link>
          <MoveRight className="text-gray-500" size={15} />
          <span className="text-black font-medium">Room {room.roomNumber}</span>
        </div>

      <div className="w-full px-4 sm:px-6 lg:px-12 py-7 bg-gray-100 rounded-4xl mb-8">
        <div className="flex flex-wrap justify-center md:justify-end mb-4">
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow hover:bg-gray-50 transition-colors disabled:opacity-50"
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={20}
              className={isInWishlist ? "fill-red-600 text-red-600" : "text-gray-600"}
            />
            <span className="text-sm font-medium text-gray-700">
              {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
            </span>
          </button>
        </div>

        {room.images && room.images.length > 0 ? (
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {room.images.map((img, idx) => (
                <div
                  key={idx}
                  className="w-full h-[300px] md:h-[350px] rounded-2xl overflow-hidden bg-gray-200"
                >
                  <img
                    src={img}
                    alt={`Room ${room.roomNumber} - Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-[300px] md:h-[350px] rounded-2xl bg-gray-200 flex items-center justify-center mb-8">
            <div className="text-center text-gray-500">
              <p>No images available</p>
            </div>
          </div>
        )}

        <div className="border-b border-gray-300 mb-8"></div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
                {room.roomType} - Room {room.roomNumber}
              </h2>
              <div className="flex items-center gap-4 text-gray-600">
                {room.capacity && (
                  <div className="flex items-center gap-1">
                    <Users size={18} />
                    <span>{room.capacity} guests</span>
                  </div>
                )}
                {room.bedType && (
                  <div className="flex items-center gap-1">
                    <Bed size={18} />
                    <span>{room.bedType}</span>
                  </div>
                )}
                {room.viewType && (
                  <div className="flex items-center gap-1">
                    <Eye size={18} />
                    <span>{room.viewType}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Price per night</p>
              <p className="text-3xl font-bold text-black">₹{room.price}</p>
            </div>

            {room.description && (
              <div>
                <h3 className="text-xl font-bold text-black mb-3">About this room</h3>
                <p className="text-gray-700 leading-relaxed">{room.description}</p>
              </div>
            )}

            {room.amenities && room.amenities.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-black mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {room.amenities.map((amenity, idx) => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-200"
                      >
                        {Icon ? <Icon size={20} className="text-gray-700" /> : <Star size={20} className="text-gray-700" />}
                        <span className="text-sm font-medium text-black">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {hotel && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-black mb-4">Hotel Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-black mb-2">{hotel.hotelName}</h4>
                    {hotel.starRating && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={18} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">{hotel.starRating} Star Rating </span>
                      </div>
                    )}
                  </div>
                  
                  {hotel.address && (hotel.address.streetAddress || hotel.address.city) && (
                    <div className="flex items-start gap-2">
                      <MapPin size={20} className="text-gray-600 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        {hotel.address.streetAddress && <p>{hotel.address.streetAddress}</p>}
                        {(hotel.address.city || hotel.address.state || hotel.address.pincode) && (
                          <p>
                            {hotel.address.city}
                            {hotel.address.state && `, ${hotel.address.state}`}
                            {hotel.address.pincode && ` ${hotel.address.pincode}`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4">
                    {hotel.contactNumber && (
                      <div className="flex items-center gap-2">
                        <Phone size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-700">{hotel.contactNumber}</span>
                      </div>
                    )}
                    {hotel.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-700">{hotel.email}</span>
                      </div>
                    )}
                  </div>

                  {(hotel.checkInTime || hotel.checkOutTime) && (
                    <div className="flex items-center gap-4 text-sm text-gray-700">
                      {hotel.checkInTime && (
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>Check-in: {hotel.checkInTime}</span>
                        </div>
                      )}
                      {hotel.checkOutTime && (
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>Check-out: {hotel.checkOutTime}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-8">
                <h3 className="text-xl font-bold text-black mb-4">Book this room</h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {pageError && (
                  <div className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
                    {pageError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    {...register("checkInDate", {
                      required: "Check-in date is required",
                      validate: (value) => {
                        if (value && new Date(value) < new Date().setHours(0, 0, 0, 0)) {
                          return "Check-in date cannot be in the past";
                        }
                        return true;
                      },
                    })}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none ${
                      errors.checkInDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.checkInDate && (
                    <p className="text-xs text-red-600 mt-1">{errors.checkInDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    {...register("checkOutDate", {
                      required: "Check-out date is required",
                      validate: (value) => {
                        if (checkInDate && value && new Date(value) <= new Date(checkInDate)) {
                          return "Check-out date must be after check-in date";
                        }
                        return true;
                      },
                    })}
                    min={checkInDate || new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none ${
                      errors.checkOutDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.checkOutDate && (
                    <p className="text-xs text-red-600 mt-1">{errors.checkOutDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Guests
                  </label>
                  <input
                    type="number"
                    {...register("totalGuests", {
                      required: "Total guests is required",
                      min: { value: 1, message: "At least 1 guest is required" },
                      max: room.capacity ? { value: room.capacity, message: `Maximum ${room.capacity} guests allowed` } : undefined,
                      validate: (value) => {
                        if (room.capacity && value > room.capacity) {
                          return `Sorry, this room allows maximum ${room.capacity} guests only. Please select another room or reduce guests.`;
                        }
                        return true;
                      },
                    })}
                    min={1}
                    max={room.capacity || 10}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none ${
                      errors.totalGuests ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.totalGuests && (
                    <p className="text-xs text-red-600 mt-1">{errors.totalGuests.message}</p>
                  )}
                  {room.capacity && !errors.totalGuests && (
                    <p className="text-xs text-gray-500 mt-1">Max capacity: {room.capacity} guests</p>
                  )}
                </div>

                {checkInDate && checkOutDate && nights > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Price per night</span>
                      <span>₹{room.price}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Nights</span>
                      <span>{nights}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between font-bold text-black">
                        <span>Total</span>
                        <span>₹{room.price * nights}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Free cancellation up to 24 hours before check-in (48 hours for selected hotels). Read our{" "}
                      <Link to="/terms" className="text-black underline font-semibold">
                        Terms &amp; Conditions
                      </Link>{" "}
                      for full policy details.
                    </p>
                  </div>
                )}

                <label className="flex items-start gap-2 mt-4">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 border-gray-400 rounded"
                    {...register("termsConsent", {
                      required: "Please accept the Terms & Conditions to continue.",
                    })}
                  />
                  <span className="text-xs sm:text-sm text-gray-600">
                    I have read and agree to the{" "}
                    <Link to="/terms" className="text-black underline font-semibold">
                      Terms &amp; Conditions
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-black underline font-semibold">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.termsConsent && (
                  <p className="text-xs text-red-600 mt-1">{errors.termsConsent.message}</p>
                )}

                <button
                  type="submit"
                  disabled={!isAvailable}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    isAvailable
                      ? "bg-black text-white hover:bg-gray-800 active:scale-95"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isAvailable ? "Book Now" : "Not Available"}
                </button>

                {!isAvailable && (
                  <p className="text-xs text-center text-gray-500">
                    This room is currently {statusDisplay.toLowerCase()}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>        
      </div>
      </div>
      </div>

    </>
  );
};

export default RoomDetails;
