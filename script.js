const currentYear = new Date().getFullYear();
const yearElement = document.querySelector("#year");
const copyFeedback = document.querySelector("#copy-feedback");
const contactMenus = [...document.querySelectorAll(".contact-menu")];
const copyTimers = new WeakMap();
const copyRequests = new WeakMap();

if (yearElement) {
  yearElement.textContent = String(currentYear);
}

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // use the fallback when clipboard permission is unavailable
    }
  }

  const previousFocus = document.activeElement;
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.setAttribute("aria-hidden", "true");
  field.tabIndex = -1;
  field.style.position = "fixed";
  field.style.top = "0";
  field.style.left = "0";
  field.style.width = "1px";
  field.style.height = "1px";
  field.style.padding = "0";
  field.style.border = "0";
  field.style.opacity = "0";
  field.style.pointerEvents = "none";

  document.body.appendChild(field);

  let copied = false;

  try {
    field.focus();
    field.select();
    copied = document.execCommand("copy");
  } finally {
    field.remove();

    try {
      previousFocus?.focus({ preventScroll: true });
    } catch {
      previousFocus?.focus();
    }
  }

  if (!copied) {
    throw new Error("The clipboard is unavailable.");
  }
}

function closeContactMenus(except = null) {
  contactMenus.forEach((menu) => {
    if (menu !== except) {
      menu.open = false;
    }
  });
}

contactMenus.forEach((menu) => {
  menu.addEventListener("toggle", () => {
    if (menu.open) {
      closeContactMenus(menu);
    }
  });
});

document.addEventListener("click", (event) => {
  const clickedInsideContactMenu = contactMenus.some((menu) => menu.contains(event.target));

  if (!clickedInsideContactMenu) {
    closeContactMenus();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  const openMenus = contactMenus.filter((menu) => menu.open);
  closeContactMenus();

  if (openMenus.length > 0) {
    openMenus[0].querySelector("summary")?.focus();
  }
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const status = button.querySelector(".option-status");
    const value = button.dataset.copy;
    const label = button.dataset.copyLabel || "text";
    const previousTimer = copyTimers.get(button);
    const requestId = (copyRequests.get(button) || 0) + 1;

    copyRequests.set(button, requestId);

    if (previousTimer) {
      window.clearTimeout(previousTimer);
      copyTimers.delete(button);
    }

    if (!value) {
      if (status) {
        status.textContent = "Unavailable";
      }
      button.classList.remove("is-copied");

      if (copyFeedback) {
        copyFeedback.textContent = `No ${label} has been set up to copy.`;
      }
      return;
    }

    if (status) {
      status.textContent = "Copying…";
    }
    button.classList.remove("is-copied");

    try {
      await copyText(value);

      if (copyRequests.get(button) !== requestId) {
        return;
      }

      if (status) {
        status.textContent = "Copied";
      }
      button.classList.add("is-copied");

      if (copyFeedback) {
        copyFeedback.textContent = `Copied ${label} to the clipboard.`;
      }
    } catch {
      if (copyRequests.get(button) !== requestId) {
        return;
      }

      if (status) {
        status.textContent = "Try again";
      }
      button.classList.remove("is-copied");

      if (copyFeedback) {
        copyFeedback.textContent = `Could not copy the ${label}. Check your browser clipboard permissions and try again.`;
      }
    }

    const timer = window.setTimeout(() => {
      if (copyRequests.get(button) !== requestId) {
        return;
      }

      if (status) {
        status.textContent = "Copy";
      }
      button.classList.remove("is-copied");
      copyTimers.delete(button);
    }, 1800);

    copyTimers.set(button, timer);
  });
});
