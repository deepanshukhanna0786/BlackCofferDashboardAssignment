package com.example.Assignment.Controller;

import com.example.Assignment.Models.Data;
import com.example.Assignment.Repo.Repo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class ApiController {
    @Autowired
    private Repo repo;
    @GetMapping(value="/")
    public String getPage(){
        return "Welcome";
    }
    @GetMapping(value="/users")
    public List<Data> getUsers(){
        return repo.findAll();
    }
    @PostMapping(value="/save")
    public String saveUsers(@RequestBody Data data){
        repo.save(data);
        return "saved......";
    }
    @CrossOrigin(origins = "*")
    @GetMapping(value="/intensity")
    public List<String> getIntensities(@RequestParam(required = false) String intensity){
        List<Data> dataList;
        if (intensity != null && !intensity.isEmpty()) {
            dataList = repo.findByIntensity(intensity); // Retrieve data for the provided intensity
        } else {
            dataList = repo.findAll(); // Retrieve all data if no intensity provided
        }
        List<String> intensities = dataList.stream()
                .map(Data::getIntensity)
                .collect(Collectors.toList());
        return intensities;
    }
    @CrossOrigin(origins = "*")
    @GetMapping(value="/country")
    public List<String> getCountry(@RequestParam(required = false) String countryFilter){
        List<Data> dataList;
        if (countryFilter != null && !countryFilter.isEmpty()) {
            dataList = repo.findByCountry(countryFilter); // Retrieve data for the provided intensity
        } else {
            dataList = repo.findAll(); // Retrieve all data if no intensity provided
        }

        Set<String> countrySet = new HashSet<>(); // Use a set to store unique country names
        dataList.stream()
                .map(Data::getCountry)
                .filter(country -> country != null && !country.isEmpty()) // Remove null or empty values
                .forEach(countrySet::add);
        return countrySet.stream().collect(Collectors.toList());
    }

    @GetMapping(value="/startandendyears")
    public List<Map<String, String>> findByStartYearAndEndYear(@RequestParam(required = false) String startYear,@RequestParam(required = false) String endYear) {
        List<Data> dataList = repo.findAll();
        List<Map<String, String>> yearPairs = new ArrayList<>();

        for (Data data : dataList) {
            Map<String, String> yearPair = new HashMap<>();
            yearPair.put("startYear", data.getStartYear());
            yearPair.put("endYear", data.getEndYear());
            yearPairs.add(yearPair);
        }

        return yearPairs;
    }

    @GetMapping(value="/likelihood")
    public List<String> getLikelihood(@RequestParam(required = false) String likelihood){
        List<Data> dataList;
        if (likelihood != null && !likelihood.isEmpty()) {
            dataList = repo.findByLikelihood(likelihood); // Retrieve data for the provided intensity
        } else {
            dataList = repo.findAll(); // Retrieve all data if no intensity provided
        }
        List<String> likelihoods = dataList.stream()
                .map(Data::getLikelihood)
                .collect(Collectors.toList());
        return likelihoods;
    }
    @GetMapping(value="/city")
    public List<String> getCity(@RequestParam(required = false) String city){
        List<Data> dataList;
        if (city != null && !city.isEmpty()) {
            dataList = repo.findByCity(city); // Retrieve data for the provided intensity
        } else {
            dataList = repo.findAll(); // Retrieve all data if no intensity provided
        }
        List<String> cities = dataList.stream()
                .map(Data::getCity)
                .collect(Collectors.toList());
        return cities;
    }
    @CrossOrigin(origins = "*")
    @GetMapping(value="/region")
    public List<String> getRegion(@RequestParam(required = false) String region){
        List<Data> dataList;
        if (region != null && !region.isEmpty()) {
            dataList = repo.findByRegion(region); // Retrieve data for the provided intensity
        } else {
            dataList = repo.findAll(); // Retrieve all data if no intensity provided
        }
        List<String> regions = dataList.stream()
                .map(Data::getRegion)
                .collect(Collectors.toList());
        return regions;
    }
    @GetMapping(value="/sector")
    public List<String> getSector(@RequestParam(required = false) String sector){
        List<Data> dataList;
        if (sector != null && !sector.isEmpty()) {
            dataList = repo.findBySector(sector); // Retrieve data for the provided intensity
        } else {
            dataList = repo.findAll(); // Retrieve all data if no intensity provided
        }
        List<String> sectors = dataList.stream()
                .map(Data::getSector)
                .collect(Collectors.toList());
        return sectors;
    }
    @GetMapping(value="/topic")
    public List<String> getTopic(@RequestParam(required = false) String topic){
        List<Data> dataList;
        if (topic != null && !topic.isEmpty()) {
            dataList = repo.findByTopic(topic); // Retrieve data for the provided intensity
        } else {
            dataList = repo.findAll(); // Retrieve all data if no intensity provided
        }
        List<String> topics = dataList.stream()
                .map(Data::getTopic)
                .collect(Collectors.toList());
        return topics;
    }
    @GetMapping(value="/relevance")
    public List<String> getRelevance(@RequestParam(required = false) String relevance){
        List<Data> dataList;
        if (relevance != null && !relevance.isEmpty()) {
            dataList = repo.findByRelevance(relevance); // Retrieve data for the provided intensity
        } else {
            dataList = repo.findAll(); // Retrieve all data if no intensity provided
        }
        List<String> relevances = dataList.stream()
                .map(Data::getRelevance)
                .collect(Collectors.toList());
        return relevances;
    }

    @GetMapping(value="/avgIntensityByCountry")
    public Map<String, Double> getAvgIntensityByCountry() {
        List<Data> allData = repo.findAll();
        Map<String, List<Data>> dataByCountry = allData.stream().collect(Collectors.groupingBy(Data::getCountry));

        Map<String, Double> avgIntensityByCountry = new HashMap<>();
        dataByCountry.forEach((country, dataList) -> {
            if (!country.isEmpty() && dataList.stream().allMatch(data -> isValidIntensity(data.getIntensity()))) {
                double totalIntensity = dataList.stream()
                        .mapToDouble(data -> Double.parseDouble(data.getIntensity()))
                        .sum();
                double avgIntensity = totalIntensity / dataList.size();
                avgIntensityByCountry.put(country, avgIntensity);
            }
        });

        return avgIntensityByCountry;
    }

    // Helper method to check if intensity value is valid
    private boolean isValidIntensity(String intensity) {
        try {
            double value = Double.parseDouble(intensity);
            return value >= 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }
    @GetMapping(value="/sumIntensityBySector")
    public Map<String, Integer> getSumIntensityBySector() {
        List<Data> allData = repo.findAll();

        // Map to store the sum of intensities for each sector
        Map<String, Integer> sumIntensityBySector = new HashMap<>();

        for (Data currentData : allData) {
            String sector = currentData.getSector();
            String intensity = currentData.getIntensity();

            // If the sector is empty, rename it to "Others"
            if (sector.isEmpty()) {
                sector = "Others";
            }

            // Parse intensity to integer
            int intensityValue = Integer.parseInt(intensity);

            // Add intensity value to the sum for the current sector
            int currentSum = sumIntensityBySector.getOrDefault(sector, 0);
            sumIntensityBySector.put(sector, currentSum + intensityValue);
        }

        return sumIntensityBySector;
    }

}
