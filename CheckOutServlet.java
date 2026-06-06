package com.parking.model;

public class ParkingSlot {
    private int id;
    private String slotNumber;
    private String status; // "empty" or "occupied"
    private String carNumber;
    private String carOwner;
    private String carType;
    private String checkInTime;
    private String qrCode;

    public ParkingSlot() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getSlotNumber() { return slotNumber; }
    public void setSlotNumber(String slotNumber) { this.slotNumber = slotNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCarNumber() { return carNumber; }
    public void setCarNumber(String carNumber) { this.carNumber = carNumber; }

    public String getCarOwner() { return carOwner; }
    public void setCarOwner(String carOwner) { this.carOwner = carOwner; }

    public String getCarType() { return carType; }
    public void setCarType(String carType) { this.carType = carType; }

    public String getCheckInTime() { return checkInTime; }
    public void setCheckInTime(String checkInTime) { this.checkInTime = checkInTime; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }
}
