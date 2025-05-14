async function checkUIDs() {
  const uidInput = document.getElementById("uidInput").value.trim();
  const liveList = document.getElementById("liveList");
  const suspendedList = document.getElementById("suspendedList");

  liveList.innerHTML = '';
  suspendedList.innerHTML = '';

  const uids = uidInput.split('\n').map(uid => uid.trim()).filter(Boolean);

  for (const uid of uids) {
    const profilePicUrl = `https://graph.facebook.com/${uid}/picture?type=large`;

    try {
      const res = await fetch(profilePicUrl, { method: "HEAD" });

      const li = document.createElement("li");
      li.textContent = uid;

      if (res.ok && !res.url.includes("error")) {
        liveList.appendChild(li);
      } else {
        suspendedList.appendChild(li);
      }
    } catch (err) {
      const li = document.createElement("li");
      li.textContent = uid + " (Error)";
      suspendedList.appendChild(li);
    }
  }
}
