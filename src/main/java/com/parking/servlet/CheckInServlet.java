package com.parking.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.dao.ParkingSlotDAO;
import com.parking.model.ParkingSlot;
import com.parking.util.QRCodeGenerator;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/checkin")
public class CheckInServlet extends HttpServlet {

    private final ParkingSlotDAO dao = new ParkingSlotDAO();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            int slotId       = Integer.parseInt(req.getParameter("slotId"));
            String carNumber = req.getParameter("carNumber");
            String carOwner  = req.getParameter("carOwner");
            String carType   = req.getParameter("carType");

            // Fetch slot for slot number
            ParkingSlot slot = dao.getSlotById(slotId);
            if (slot == null) {
                resp.setStatus(404);
                resp.getWriter().write("{\"error\":\"Slot not found\"}");
                return;
            }
            if (!"empty".equals(slot.getStatus())) {
                resp.setStatus(400);
                resp.getWriter().write("{\"error\":\"Slot is already occupied\"}");
                return;
            }

            // Build QR content
            String qrContent = "PARKING TOKEN\n" +
                    "Slot: " + slot.getSlotNumber() + "\n" +
                    "Car Number: " + carNumber + "\n" +
                    "Owner: " + carOwner + "\n" +
                    "Car Type: " + carType + "\n" +
                    "Check-In: " + new java.util.Date();

            String qrBase64 = QRCodeGenerator.generateQRBase64(qrContent);

            boolean success = dao.checkIn(slotId, carNumber, carOwner, carType, qrBase64);
            if (!success) {
                resp.setStatus(500);
                resp.getWriter().write("{\"error\":\"Check-in failed\"}");
                return;
            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("slotNumber", slot.getSlotNumber());
            result.put("carNumber", carNumber);
            result.put("carOwner", carOwner);
            result.put("carType", carType);
            result.put("qrCode", qrBase64);

            resp.getWriter().write(mapper.writeValueAsString(result));
        } catch (Exception e) {
            resp.setStatus(500);
            resp.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}
