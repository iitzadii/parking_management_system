package com.parking.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.dao.ParkingSlotDAO;
import com.parking.model.ParkingSlot;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/slots")
public class GetSlotsServlet extends HttpServlet {

    private final ParkingSlotDAO dao = new ParkingSlotDAO();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        try {
            List<ParkingSlot> slots = dao.getAllSlots();
            // Strip QR data from list view to save bandwidth
            slots.forEach(s -> s.setQrCode(null));
            resp.getWriter().write(mapper.writeValueAsString(slots));
        } catch (Exception e) {
            resp.setStatus(500);
            resp.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}
