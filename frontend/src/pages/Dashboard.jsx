import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const res = await fetch("https://careerpath-54sr.onrender.com/api/roadmaps");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setRoadmaps(data);
        console.log("📊 Roadmaps fetched successfully:", data);
      } catch (err) {
        console.error("❌ Error fetching roadmaps:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  if (loading) return <p className="p-8">Loading roadmaps...</p>;
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Role-based Roadmaps</h1>
      <div className="grid grid-cols-3 gap-6">
        {roadmaps.map((r) => (
          <div
            key={r._id}
            onClick={() => navigate(`/roadmap/${r._id}`)}
            className="p-6 bg-gray-800 text-white rounded-xl cursor-pointer hover:scale-105 transition"
          >
            {r.title}
          </div>
        ))}
      </div>
    </div>
  );
}
