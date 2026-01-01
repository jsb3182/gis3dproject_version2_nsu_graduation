package com.study.domain.shelter;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "shelter", indexes = {
    @Index(name = "idx_shelter_geom", columnList = "geom")
})
public class Shelter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shelter_id", unique = true, nullable = false, length = 50)
    private String shelterId;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "address", length = 300)
    private String address;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "area")
    private Double area;

    @Column(name = "tel", length = 50)
    private String tel;

    @Column(name = "fclty_manage_org", length = 200)
    private String fcltyManageOrg;

    @Column(name = "geom", columnDefinition = "geometry(Point,4326)", nullable = false)
    private Point geom;

    // Constructors
    public Shelter() {
    }

    public Shelter(String shelterId, String name, String address, Integer capacity,
                   Double area, String tel, String fcltyManageOrg, Point geom) {
        this.shelterId = shelterId;
        this.name = name;
        this.address = address;
        this.capacity = capacity;
        this.area = area;
        this.tel = tel;
        this.fcltyManageOrg = fcltyManageOrg;
        this.geom = geom;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getShelterId() {
        return shelterId;
    }

    public void setShelterId(String shelterId) {
        this.shelterId = shelterId;
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

    public Point getGeom() {
        return geom;
    }

    public void setGeom(Point geom) {
        this.geom = geom;
    }
}