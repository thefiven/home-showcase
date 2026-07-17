export type BookingRequestEmailData = {
  documentId: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  numberOfGuests?: number | null;
  message?: string | null;
};

export type BookingRequestEmailContent = {
  subject: string;
  text: string;
  html: string;
};

function buildAdminLink(adminUrl: string, documentId: string): string {
  return `${adminUrl.replace(/\/$/, "")}/content-manager/collection-types/api::booking-request.booking-request/${documentId}`;
}

/**
 * guestName/guestEmail/guestPhone/message come from an unauthenticated
 * visitor (public POST /booking-requests) and are interpolated into the
 * HTML email body sent to the owner — escape them so a crafted submission
 * can't inject markup/links into her inbox (issue #41). propertyName and
 * adminLink are admin-controlled, not visitor input, so they're left as-is.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildBookingRequestEmail(
  booking: BookingRequestEmailData,
  { adminUrl }: { adminUrl: string },
): BookingRequestEmailContent {
  const adminLink = buildAdminLink(adminUrl, booking.documentId);

  const lines = [
    `Logement : ${booking.propertyName}`,
    `Dates : du ${booking.startDate} au ${booking.endDate}`,
    `Demandeur : ${booking.guestName} (${booking.guestEmail})`,
  ];
  if (booking.guestPhone) lines.push(`Téléphone : ${booking.guestPhone}`);
  if (booking.numberOfGuests != null) lines.push(`Nombre de voyageurs : ${booking.numberOfGuests}`);
  if (booking.message) lines.push(`Message : ${booking.message}`);
  lines.push("", `Voir la demande dans l'admin : ${adminLink}`);

  const htmlLines = [
    `<p><strong>Logement :</strong> ${booking.propertyName}</p>`,
    `<p><strong>Dates :</strong> du ${booking.startDate} au ${booking.endDate}</p>`,
    `<p><strong>Demandeur :</strong> ${escapeHtml(booking.guestName)} (${escapeHtml(booking.guestEmail)})</p>`,
  ];
  if (booking.guestPhone)
    htmlLines.push(`<p><strong>Téléphone :</strong> ${escapeHtml(booking.guestPhone)}</p>`);
  if (booking.numberOfGuests != null) {
    htmlLines.push(`<p><strong>Nombre de voyageurs :</strong> ${booking.numberOfGuests}</p>`);
  }
  if (booking.message)
    htmlLines.push(`<p><strong>Message :</strong> ${escapeHtml(booking.message)}</p>`);
  htmlLines.push(`<p><a href="${adminLink}">Voir la demande dans l'admin</a></p>`);

  return {
    subject: `Nouvelle demande de réservation — ${booking.propertyName}`,
    text: lines.join("\n"),
    html: htmlLines.join("\n"),
  };
}
