package com.study.domain.shelter;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

/**
 * GeoJSON Feature 형태의 대피소 DTO
 */
public class ShelterDTO {
    private String type = "Feature";
    private Long id;
    private Geometry geometry;
    private Properties properties;

    // 거리 정보 (미터)
    private Integer distance;

    // Constructors
    public ShelterDTO() {
    }

    public ShelterDTO(Long id, String name, String address, Integer capacity,
                      Double area, String tel, String fcltyManageOrg,
                      double lon, double lat, Integer distance) {
        this.id = id;
        this.geometry = new Geometry(lon, lat);
        this.properties = new Properties(name, address, capacity, area, tel, fcltyManageOrg);
        this.distance = distance;
    }

    // Inner Classes
    public static class Geometry {
        private String type = "Point";
        private double[] coordinates;

        public Geometry() {
        }

        public Geometry(double lon, double lat) {
            this.coordinates = new double[]{lon, lat};
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public double[] getCoordinates() {
            return coordinates;
        }

        public void setCoordinates(double[] coordinates) {
            this.coordinates = coordinates;
        }
    }

    public static class Properties {
        private String name;
        private String address;
        private Integer capacity;
        private Double area;
        private String tel;

        @JsonProperty("fcltyManageOrg")
        private String fcltyManageOrg;

        public Properties() {
        }

        public Properties(String name, String address, Integer capacity,
                         Double area, String tel, String fcltyManageOrg) {
            this.name = name;
            this.address = address;
            this.capacity = capacity;
            this.area = area;
            this.tel = tel;
            this.fcltyManageOrg = fcltyManageOrg;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public Integer getCapacity() {
            return capacity;
        }

        public void setCapacity(Integer capacity) {
            this.capacity = capacity;
        }

        public Double getArea() {
            return area;
        }

        public void setArea(Double area) {
            this.area = area;
        }

        public String getTel() {
            return tel;
        }

        public void setTel(String tel) {
            this.tel = tel;
        }

        public String getFcltyManageOrg() {
            return fcltyManageOrg;
        }

        public void setFcltyManageOrg(String fcltyManageOrg) {
            this.fcltyManageOrg = fcltyManageOrg;
        }
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Geometry getGeometry() {
        return geometry;
    }

    public void setGeometry(Geometry geometry) {
        this.geometry = geometry;
    }

    public Properties getProperties() {
        return properties;
    }

    public void setProperties(Properties properties) {
        this.properties = properties;
    }

    public Integer getDistance() {
        return distance;
    }

    public void setDistance(Integer distance) {
        this.distance = distance;
    }

    // Flatten properties for easier frontend access
    public String getName() {
        return properties != null ? properties.getName() : null;
    }

    public String getAddress() {
        return properties != null ? properties.getAddress() : null;
    }

    public Integer getCapacity() {
        return properties != null ? properties.getCapacity() : null;
    }

    public Double getArea() {
        return properties != null ? properties.getArea() : null;
    }

    public String getTel() {
        return properties != null ? properties.getTel() : null;
    }

    @JsonProperty("fcltyManageOrg")
    public String getFcltyManageOrg() {
        return properties != null ? properties.getFcltyManageOrg() : null;
    }
}