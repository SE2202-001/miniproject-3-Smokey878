class Job {
    constructor(job) {
      this.title = job["Title"] || "No Title";
      this.posted = this.normalizePostedTime(job["Posted"]);
      this.type = job["Type"] || "No Type";
      this.level = job["Level"] || "No Level";
      this.skill = job["Skill"] || "No Skill";
      this.detail = job["Detail"] || "No Details";
      this.link = job["Job Page Link"] || "#";
    }
  
    normalizePostedTime(posted) {
      const match = /(\d+)\s*(minutes?|hours?|days?)\s*ago/i.exec(posted);
      if (!match) return Infinity; // Invalid data treated as oldest
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.startsWith("minute")) return value;
      if (unit.startsWith("hour")) return value * 60;
      if (unit.startsWith("day")) return value * 60 * 24;
      return Infinity;
    }
  
    getDetails() {
      return `
        Title: ${this.title}
        Posted: ${this.posted} minutes ago
        Type: ${this.type}
        Level: ${this.level}
        Skill: ${this.skill}
        Detail: ${this.detail}
        Link: <a href="${this.link}" target="_blank">View Job</a>
      `;
    }
  }
  
  let jobs = [];
  const fileInput = document.getElementById("file-input");
  const filterLevel = document.getElementById("filter-level");
  const filterType = document.getElementById("filter-type");
  const filterSkill = document.getElementById("filter-skill");
  const sortBy = document.getElementById("sort-by");
  const jobListings = document.getElementById("job-listings");
  
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        jobs = data.map(job => new Job(job));
        populateFilters();
        renderJobs();
      } catch (error) {
        alert("Error parsing JSON file. Please check the format.");
      }
    };
    reader.readAsText(file);
  });
  
  function populateFilters() {
    const levels = new Set(jobs.map(job => job.level));
    const types = new Set(jobs.map(job => job.type));
    const skills = new Set(jobs.map(job => job.skill));
  
    updateDropdown(filterLevel, levels);
    updateDropdown(filterType, types);
    updateDropdown(filterSkill, skills);
  }
  
  function updateDropdown(dropdown, values) {
    dropdown.innerHTML = `<option value="">All</option>`;
    values.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      dropdown.appendChild(option);
    });
  }
  
  function renderJobs() {
    const filters = {
      level: filterLevel.value,
      type: filterType.value,
      skill: filterSkill.value,
    };
  
    const filteredJobs = jobs.filter(job => {
      return (
        (!filters.level || job.level === filters.level) &&
        (!filters.type || job.type === filters.type) &&
        (!filters.skill || job.skill === filters.skill)
      );
    });
  
    const sortedJobs = filteredJobs.sort((a, b) => {
      switch (sortBy.value) {
        case "title-asc": return a.title.localeCompare(b.title);
        case "title-desc": return b.title.localeCompare(a.title);
        case "time-oldest": return a.posted - b.posted;
        case "time-newest": return b.posted - a.posted;
        default: return 0;
      }
    });
  
    jobListings.innerHTML = sortedJobs.map(job => `
      <div class="job-listing" onclick="alert(\`${job.getDetails()}\`)">
        <h3>${job.title}</h3>
        <p>Posted: ${job.posted} minutes ago</p>
        <p>Type: ${job.type}, Level: ${job.level}, Skill: ${job.skill}</p>
        <a href="${job.link}" target="_blank">View Job</a>
      </div>
    `).join("");
  }
  
  [filterLevel, filterType, filterSkill, sortBy].forEach(element => {
    element.addEventListener("change", renderJobs);
  });
  