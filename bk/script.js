document.addEventListener('DOMContentLoaded', function() {
    let limit = 10; // Initial limit    

    // Function to fetch data from API
    function fetchData(url, callback) {
        fetch(url)
            .then(response => response.json())
            .then(data => callback(data))
            .catch(error => console.error('Error fetching data:', error));
    }

    // Function to create bar chart
    function createBarChart(title, labels, data, chartId, initialLimit) {
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        let widthPerBar = 100; // Fixed width per bar
        let maxBars = 2500 / widthPerBar; // Maximum number of bars to fit within 2500 width
        let width = Math.min(2500, labels.length * widthPerBar); // Calculate width based on number of bars and fixed width per bar
        const height = 500 - margin.top - margin.bottom;

        const limitedLabels = labels.slice(0, initialLimit); // Limit labels to initial limit

        const x = d3.scaleBand()
            .domain(limitedLabels)
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data)])
            .range([height, 0]);

        const svg = d3.select(`#${chartId}`)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const barWidth = x.bandwidth();

        const barGroups = svg.selectAll(".bar")
            .data(data.slice(0, initialLimit)) // Limit data to initial limit
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", (d, i) => `translate(${x(limitedLabels[i])}, 0)`);

        barGroups.append("rect")
            .attr("width", barWidth)
            .attr("y", d => y(d))
            .attr("height", d => height - y(d))
            .attr("fill", "skyblue");

        barGroups.append("text")
            .attr("x", barWidth / 2)
            .attr("y", d => y(d) - 5)
            .attr("dy", "-0.5em")
            .style("text-anchor", "middle")
            .style("font-size", "12px") // Adjust font size as needed
            .attr("fill", "black") // Set text color
            .text((d, i) => {
                if (limitedLabels[i].length > 12) {
                    return limitedLabels[i].substring(0, 9) + '...'; // Show only first 9 characters followed by dots
                } else {
                    return limitedLabels[i];
                }
            });

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("x", 500 )
            .attr("y", 0 + (margin.top / 2))
            .attr("text-anchor", "end")
            .style("font-size", "30px")
            .text(title);
        
        // Function to update bar chart with new limit
        function updateBarChart() {
            const limit = document.getElementById('volumeSeeker').value;
            const limitedLabels = labels.slice(0, limit);
            const limitedData = data.slice(0, limit);
        
            let width = Math.min(3000, limitedLabels.length * widthPerBar); // Adjust width based on number of bars
            x.range([0, width]);
        
            svg.selectAll(".bar").remove(); // Clear previous bars
            svg.selectAll(".x-axis").remove(); // Remove existing x-axis group
        
            const newX = d3.scaleBand()
                .domain(limitedLabels)
                .range([0, width])
                .padding(0.1);
        
            const newBarGroups = svg.selectAll(".bar")
                .data(limitedData)
                .enter().append("g")
                .attr("class", "bar")
                .attr("transform", (d, i) => `translate(${newX(limitedLabels[i])}, 0)`);
        
            newBarGroups.append("rect")
                .attr("width", newX.bandwidth())
                .attr("y", d => y(d))
                .attr("height", d => height - y(d))
                .attr("fill", "skyblue");
        
            // Update text with overflow handling for labels longer than 12 characters
            newBarGroups.append("text")
                .attr("x", newX.bandwidth() / 2)
                .attr("y", d => y(d) - 5)
                .attr("dy", "-0.5em")
                .style("text-anchor", "middle")
                .style("font-size", "12px") // Adjust font size as needed
                .attr("fill", "black"); // Set text color

        
            svg.append("g")
                .attr("class", "x-axis") // Add class to identify x-axis group
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(newX))
                .selectAll("text")
                .call(wrap, newX.bandwidth()); // Call wrap function on x-axis text
        
            svg.append("g")
                .call(d3.axisLeft(y));
        }

        // Event listener for volume seeker
        document.getElementById('volumeSeeker').addEventListener('input', updateBarChart);
    }
    
    // Function to wrap text
    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" ") + "...");
                    break;
                }
            }
        });
    }
    
    // Call createBarChart with initial limit
    fetchData('http://localhost:8080/avgIntensityByCountry', function(data) {
        const countries = Object.keys(data);
        const intensities = Object.values(data);
        createBarChart('Intensity/Countries', countries, intensities, 'intensityChart', limit);
    });


    // Function to create line graph
    function createLineGraph(title, labels, data, chartId, initialLimit) {
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        let width = 2500 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const limitedLabels = labels.slice(0, initialLimit); // Limit labels to initial limit

        const x = d3.scaleBand()
            .domain(limitedLabels)
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data)])
            .range([height, 0]);

        const line = d3.line()
            .x((d, i) => x(limitedLabels[i]))
            .y(d => y(d));

        const svg = d3.select(`#${chartId}`)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("path")
            .datum(data.slice(0, initialLimit))
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        svg.selectAll(".dot")
            .data(data.slice(0, initialLimit))
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", (d, i) => x(limitedLabels[i]))
            .attr("cy", d => y(d))
            .attr("r", 5);

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 0 + (margin.top / 2))
            .attr("text-anchor", "end")
            .style("font-size", "30px")
            .text(title);
        
        // Function to update line graph with new limit
        function updateLineGraph() {
            const limit = document.getElementById('lineGraphLimitSeeker').value;
            const limitedLabels = labels.slice(0, limit);
            const limitedData = data.slice(0, limit);
        
            let width = Math.min(3000, limitedLabels.length * x.bandwidth()); // Adjust width based on number of bars
        
            x.range([0, width]);
        
            svg.selectAll("path").remove(); // Clear previous path
            svg.selectAll(".dot").remove(); // Clear previous dots
            svg.selectAll(".x-axis").remove(); // Remove existing x-axis group
        
            const newLine = d3.line()
                .x((d, i) => x(limitedLabels[i]))
                .y(d => y(d));
        
            svg.append("path")
                .datum(limitedData)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2)
                .attr("d", newLine);
        
            svg.selectAll(".dot")
                .data(limitedData)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", (d, i) => x(limitedLabels[i]))
                .attr("cy", d => y(d))
                .attr("r", 5);
        
            svg.append("g")
                .attr("class", "x-axis") // Add class to identify x-axis group
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .call(wrap, x.bandwidth()); // Call wrap function on x-axis text
        
            svg.append("g")
                .call(d3.axisLeft(y));
        }

        // Event listener for line graph volume seeker
        document.getElementById('lineGraphLimitSeeker').addEventListener('input', function() {
            limit = this.value;
            updateLineGraph();
        });
    }
    
    // Call createLineGraph with initial limit
    fetchData('http://localhost:8080/avgIntensityByCountry', function(data) {
        const countries = Object.keys(data);
        const intensities = Object.values(data);
        createLineGraph('Intensity', countries, intensities, 'lineChart', limit);
    });
    function createPieChart(data) {
        const sectors = Object.keys(data);
        const intensities = Object.values(data);
        const totalIntensity = intensities.reduce((sum, value) => sum + value, 0);
    
        const width = 1200; // SVG width
        const height = 800; // SVG height
        const radius = Math.min(width, height) / 2 ; // Adjusted radius
    
        const color = d3.scaleOrdinal(d3.schemeCategory10);
    
        const svg = d3.select("#pieChart")
            .append("svg")
            .attr("viewBox", `0 0 ${width + 400} ${height}`) // Increased width for legend
            .attr("preserveAspectRatio", "xMidYMid meet");
    
        // Add title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "28px") // Increased font size for title
            .text("Intensity/Sector");
    
        const pie = d3.pie()
            .value(d => d)
            .sort(null);
    
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);
    
        const arcs = svg.selectAll(".arc")
            .data(pie(intensities))
            .enter()
            .append("g")
            .attr("class", "arc")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    
        arcs.append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => color(i))
            .attr("stroke", "white");
    
        // Legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width}, 100)`); // Adjusted position to the right of the chart
    
        const legendItemWidth = 250; // Width for each legend item block
        const legendItemHeight = 50; // Height for each legend item block
        const itemsPerRow = 2; // Number of items per row, set to 1 to stack vertically
    
        const legendItem = legend.selectAll(".legend-item")
            .data(sectors)
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => {
                const x = (i % itemsPerRow) * legendItemWidth;
                const y = Math.floor(i / itemsPerRow) * legendItemHeight;
                return `translate(${x},${y})`;
            });
    
        legendItem.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", (d, i) => color(i));
    
        legendItem.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("font-size", "20px") // Increased font size for readability
            .text(d => d);
    }
    
    // Call fetchData for pie chart
    fetchData('http://localhost:8080/sumIntensityBySector', function(data) {
        createPieChart(data);
    });
    
    
    
    const toggleNavbar = () => {
        const navbarToggle = document.querySelector('.navbar-toggle');
        const navLinks = document.querySelector('.nav-links');

        navbarToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active'); // Toggle the "active" class on click
        });

        // Add event listener to menu items to close dropdown when clicked
        const menuItems = document.querySelectorAll('.nav-links li a');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active'); // Remove "active" class when a menu item is clicked
            });
        });
    };

    // Call toggleNavbar function
    toggleNavbar();
});



// Excluded the wrap function from the code for the line graph
