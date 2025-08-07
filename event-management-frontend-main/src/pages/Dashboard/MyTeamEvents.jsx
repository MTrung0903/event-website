import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../Auth/AuthProvider";
import { User, MessageCircle } from "lucide-react";
import ChatBubble from "../ChatBox/ChatBubble";

const MyTeamEvents = () => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const { user } = useAuth();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const token = localStorage.getItem("token");

  const fetchTeamEvents = async (eventId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/role-assignment/${eventId}/my-team-events`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(t('myTeamEvents.error', { message: "Failed to load team data" }));
      }
      const result = await response.json();
      setTeamData(result);
    } catch (err) {
      setError(t('myTeamEvents.error', { message: err.message }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId && token) {
      fetchTeamEvents(eventId);
    }
  }, [eventId, token]);

  const handleChatClick = (member) => {
    setSelectedChatUser({
      userId: member.userId,
      email: member.email,
      name: member.fullName || "Unknown",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500"
          aria-label={t('myTeamEvents.loadingAlt')}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!teamData || teamData.totalMembers === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-gray-100 text-gray-600 p-4 rounded-lg">
          {t('myTeamEvents.noMembers')}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl min-h-screen p-6 bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('myTeamEvents.teamHeader', { eventId: teamData.eventId })}
        </h1>
        <p className="text-lg text-gray-600 mt-2 sm:mt-0">
          {t('myTeamEvents.totalMembers', { count: teamData.totalMembers })}
        </p>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamData.users.map((member) => (
          <div
            key={member.userId}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 relative"
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                {member.fullName}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-500 font-medium w-24">
                  {t('myTeamEvents.emailLabel')}
                </span>
                <span className="text-gray-700">{member.email}</span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 font-medium w-24">
                  {t('myTeamEvents.rolesLabel')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {member.rolesAssigned.map((role, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-full"
                    >
                      {role.replace(t('myTeamEvents.rolePrefix'), "")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {member.email !== user.email && (
              <button
                onClick={() => handleChatClick(member)}
                className="absolute top-4 right-4 p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-200"
                title={t('myTeamEvents.chatButtonTitle')}
                aria-label={t('myTeamEvents.chatButtonTitle')}
              >
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Chat Bubble */}
      {selectedChatUser && (
        <ChatBubble
          currentUser={user}
          initialSelectedUser={selectedChatUser}
          onClose={() => setSelectedChatUser(null)}
        />
      )}
    </div>
  );
};

export default MyTeamEvents;