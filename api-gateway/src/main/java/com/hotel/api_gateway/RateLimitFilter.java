package com.hotel.api_gateway;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MS = 60_000;

    private final Map<String, RequestCounter> clients =
            new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // Do not rate-limit CORS preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = request.getRemoteAddr();
        long currentTime = System.currentTimeMillis();

        RequestCounter counter = clients.computeIfAbsent(
                clientIp,
                key -> new RequestCounter(currentTime)
        );

        synchronized (counter) {

            if (currentTime - counter.getStartTime() >= WINDOW_MS) {
                counter.setStartTime(currentTime);
                counter.getCount().set(0);
            }

            int requestCount = counter.getCount().incrementAndGet();

            if (requestCount > MAX_REQUESTS) {
                response.setStatus(429);
                response.setContentType("application/json");

                response.getWriter().write(
                        "{\"error\":\"Too many requests. Please try again later.\"}"
                );

                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private static class RequestCounter {

        private long startTime;

        private final AtomicInteger count =
                new AtomicInteger(0);

        public RequestCounter(long startTime) {
            this.startTime = startTime;
        }

        public long getStartTime() {
            return startTime;
        }

        public void setStartTime(long startTime) {
            this.startTime = startTime;
        }

        public AtomicInteger getCount() {
            return count;
        }
    }
}