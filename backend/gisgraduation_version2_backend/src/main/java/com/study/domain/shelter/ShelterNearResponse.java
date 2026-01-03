package com.study.domain.shelter;

public class ShelterNearResponse {

    private Integer gid;
    private String manageNumber;
    private String dedongSemugo;
    private String detailAddress;
    private String addressNumber;
    private Double maxDepiPerson;
    private Double maxArea;
    private Double longitude;
    private Double latitude;
    private Double distance;

    public ShelterNearResponse() {}

    // gid
    public Integer getGid() {
        return gid;
    }
    public void setGid(Integer gid) {
        this.gid = gid;
    }

    // manageNumber
    public String getManageNumber() {
        return manageNumber;
    }
    public void setManageNumber(String manageNumber) {
        this.manageNumber = manageNumber;
    }

    // dedongSemugo (시설명)
    public String getDedongSemugo() {
        return dedongSemugo;
    }
    public void setDedongSemugo(String dedongSemugo) {
        this.dedongSemugo = dedongSemugo;
    }

    // detailAddress
    public String getDetailAddress() {
        return detailAddress;
    }
    public void setDetailAddress(String detailAddress) {
        this.detailAddress = detailAddress;
    }

    // addressNumber
    public String getAddressNumber() {
        return addressNumber;
    }
    public void setAddressNumber(String addressNumber) {
        this.addressNumber = addressNumber;
    }

    // maxDepiPerson
    public Double getMaxDepiPerson() {
        return maxDepiPerson;
    }
    public void setMaxDepiPerson(Double maxDepiPerson) {
        this.maxDepiPerson = maxDepiPerson;
    }

    // maxArea
    public Double getMaxArea() {
        return maxArea;
    }
    public void setMaxArea(Double maxArea) {
        this.maxArea = maxArea;
    }

    // longitude
    public Double getLongitude() {
        return longitude;
    }
    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    // latitude
    public Double getLatitude() {
        return latitude;
    }
    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    // distance
    public Double getDistance() {
        return distance;
    }
    public void setDistance(Double distance) {
        this.distance = distance;
    }
}
