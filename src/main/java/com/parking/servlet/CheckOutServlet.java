package com.parking.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.dao.ParkingSlotDAO;
import com.parking.dao.ParkingSlotDAO.CheckoutResult;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/checkout")
public class CheckOutServlet extends HttpServlet {

    private final ParkingSlotDAO dao = new ParkingSlotDAO();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            int slotId = Integer.parseInt(req.getParameter("slotId"));
            CheckoutResult result = dao.checkOut(slotId);

            if (result == null) {
                resp.setStatus(400);
                resp.getWriter().write("{\"error\":\"Slot is not occupied or not found\"}");
                return;
            }

            long hours = (long) Math.ceil(result.getMinutesParked() / 60.0);
            if (hours < 1) hours = 1;

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("slotNumber", result.getSlot().getSlotNumber());
            response.put("carNumber", result.getSlot().getCarNumber());
            response.put("carOwner", result.getSlot().getCarOwner());
            response.put("carType", result.getSlot().getCarType());
            response.put("checkInTime", result.getSlot().getCheckInTime());
            response.put("minutesParked", result.getMinutesParked());
            response.put("hoursCharged", hours);
            response.put("fare", result.getFare());

            resp.getWriter().write(mapper.writeValueAsString(response));
        } catch (Exception e) {
            resp.setStatus(500);
            resp.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}
