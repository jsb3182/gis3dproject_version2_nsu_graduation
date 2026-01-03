package com.study.domain.shelter;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "minbangwi")
public class Shelter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer gid;

    @Column(name = "manage_number")
    private String manageNumber;

    @Column(name = "dedong_semugo")
    private String name;

    @Column(name = "sisul_gubum")
    private String facilityType;

    @Column(name = "underground")
    private String underground;

    @Column(name = "detail_address")
    private String detailAddress;

    @Column(name = "address_number")
    private String addressNumber;

    @Column(name = "max_depi_person")
    private Double maxDepiPerson;

    @Column(name = "max_area")
    private Double maxArea;

    @Column(name = "city_code")
    private String cityCode;

    @Column(name = "city_number")
    private String cityNumber;

    @Column(name = "city")
    private String city;

    @Column(name = "henjung_code")
    private String henjungCode;

    @Column(name = "henjung_name")
    private String henjungName;

    // PostGIS geometry
    @Column(columnDefinition = "geometry(Point,4326)")
    private Point geom;

    /* =========================
       getter / setter
       ========================= */

    public Integer getGid() {
        return gid;
    }

    public void setGid(Integer gid) {
        this.gid = gid;
    }

    public String getManageNumber() {
        return manageNumber;
    }

    public void setManageNumber(String manageNumber) {
        this.manageNumber = manageNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFacilityType() {
        return facilityType;
    }

    public void setFacilityType(String facilityType) {
        this.facilityType = facilityType;
    }

    public String getUnderground() {
        return underground;
    }

    public void setUnderground(String underground) {
        this.underground = underground;
    }

    public String getDetailAddress() {
        return detailAddress;
    }

    public void setDetailAddress(String detailAddress) {
        this.detailAddress = detailAddress;
    }

    public String getAddressNumber() {
        return addressNumber;
    }

    public void setAddressNumber(String addressNumber) {
        this.addressNumber = addressNumber;
    }

    public Double getMaxDepiPerson() {
        return maxDepiPerson;
    }

    public void setMaxDepiPerson(Double maxDepiPerson) {
        this.maxDepiPerson = maxDepiPerson;
    }

    public Double getMaxArea() {
        return maxArea;
    }

    public void setMaxArea(Double maxArea) {
        this.maxArea = maxArea;
    }

    public String getCityCode() {
        return cityCode;
    }

    public void setCityCode(String cityCode) {
        this.cityCode = cityCode;
    }

    public String getCityNumber() {
        return cityNumber;
    }

    public void setCityNumber(String cityNumber) {
        this.cityNumber = cityNumber;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getHenjungCode() {
        return henjungCode;
    }

    public void setHenjungCode(String henjungCode) {
        this.henjungCode = henjungCode;
    }

    public String getHenjungName() {
        return henjungName;
    }

    public void setHenjungName(String henjungName) {
        this.henjungName = henjungName;
    }

    public Point getGeom() {
        return geom;
    }

    public void setGeom(Point geom) {
        this.geom = geom;
    }
}
