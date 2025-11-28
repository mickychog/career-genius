import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { toast } from "react-toastify";
import "./SkillsDevelopmentPage.css";

interface Course {
  title: string;
  platform: string;
  type: "Preuniversitario" | "Fundamentos" | "Habilidad Blanda";
  description: string;
  searchQuery: string;
  difficulty: string;
}

const SkillsDevelopmentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [careerName, setCareerName] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [noTestFound, setNoTestFound] = useState(false);

  // Estados para Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Mostramos 8 cursos por página

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(
          "/skills-development/recommendations"
        );
        setCareerName(response.data.career);
        setCourses(response.data.courses);
      } catch (error: any) {
        console.error("Error fetching skills:", error);
        if (error.response && error.response.status === 404) {
          setNoTestFound(true);
        } else {
          toast.error("Error al cargar recomendaciones. Intenta más tarde.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenCourse = (query: string, platform: string) => {
    let url = "";
    if (platform.toLowerCase().includes("youtube")) {
      url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        query
      )}`;
    } else {
      url = `https://www.google.com/search?q=${encodeURIComponent(
        query + " curso gratis online"
      )}`;
    }
    window.open(url, "_blank");
  };

  // Lógica de Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = courses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Subir al inicio al cambiar página
  };

  if (loading)
    return (
      <div className="results-loading">🛠️ Diseñando tu plan de estudio...</div>
    );

  if (noTestFound) {
    return (
      <div className="uni-search-container">
        <div className="no-test-state">
          <div className="no-test-icon">🛠️</div>
          <h2>Primero descubre tu vocación</h2>
          <p>
            Necesitamos saber qué carrera te interesa para recomendarte cursos.
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate("/dashboard/vocational-test")}
          >
            Ir al Test Vocacional
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="skills-container animate-fade-in">
      <div className="skills-header">
        <h2>
          Plan de Desarrollo:{" "}
          <span style={{ color: "#667eea" }}>{careerName}</span>
        </h2>
        <p>
          Hemos seleccionado estos {courses.length} recursos gratuitos para que
          empieces a prepararte hoy mismo, enfocados en el ingreso a la
          universidad y fundamentos básicos.
        </p>
      </div>

      <div className="course-grid">
        {currentCourses.map((course, index) => (
          <div key={index} className="course-card">
            <div
              className={`course-thumbnail ${
                course.platform.toLowerCase().includes("youtube")
                  ? "thumbnail-youtube"
                  : "thumbnail-khan"
              }`}
            >
              {course.platform.toLowerCase().includes("youtube") ? "▶" : "📚"}
            </div>
            <div className="course-content">
              <div
                className={`course-type ${
                  course.type === "Preuniversitario"
                    ? "badge-preu"
                    : course.type === "Fundamentos"
                    ? "badge-funda"
                    : "badge-soft"
                }`}
              >
                {course.type} • {course.difficulty}
              </div>
              <h3 className="course-title">{course.title}</h3>
              <p className="course-desc">{course.description}</p>
              <button
                className="btn-start-course"
                onClick={() =>
                  handleOpenCourse(course.searchQuery, course.platform)
                }
              >
                <span>Ver en {course.platform}</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="btn-page-nav"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`btn-page-number ${
                currentPage === i + 1 ? "active" : ""
              }`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn-page-nav"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillsDevelopmentPage;
