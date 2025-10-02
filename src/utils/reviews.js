// src/utils/reviews.js

// LocalStorage key
const STORAGE_KEY = "car_reviews";

let subscribers = [];

// Fetch all reviews
export function getAllReviews({ status } = {}) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  return status ? all.filter((r) => r.status === status) : all;
}

// Subscribe for live updates
export function subscribeReviews(fn) {
  subscribers.push(fn);
  return () => {
    subscribers = subscribers.filter((f) => f !== fn);
  };
}

function notify() {
  subscribers.forEach((fn) => fn());
}

// Add a review (from MyBookings)
export function addReview(carId, review) {
  const all = getAllReviews();
  all.push({
    id: Date.now().toString(),
    carId,
    ...review,
    status: "pending", // Default: Pending until admin approves
    reply: null,
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  notify();
}

// Check if booking has already been reviewed
export function hasReviewed(carId, bookingId) {
  return getAllReviews().some(
    (r) => r.carId === carId && r.bookingId === bookingId
  );
}

// Approve a review
export function approveReview(id) {
  const all = getAllReviews().map((r) =>
    r.id === id ? { ...r, status: "approved" } : r
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  notify();
}

// Reject a review
export function rejectReview(id) {
  const all = getAllReviews().map((r) =>
    r.id === id ? { ...r, status: "rejected" } : r
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  notify();
}

// Delete a review
export function removeReview(id) {
  const all = getAllReviews().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  notify();
}

// Reply to a review
export function replyToReview(id, reply) {
  const all = getAllReviews().map((r) =>
    r.id === id
      ? { ...r, reply: { ...reply, date: new Date().toISOString().slice(0, 10) } }
      : r
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  notify();
}
