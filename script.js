// ฟังก์ชันสำหรับเรียกใช้ Toast
function showToast(message) {
    // ลบอันเก่าถ้ามีอยู่
    const oldToast = document.querySelector('.copy-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.innerHTML = `<span>✅</span> ${message}`;
    document.body.appendChild(toast);

    // สั่งให้แสดงผล (ใช้ setTimeout เพื่อให้ transition ทำงาน)
    setTimeout(() => toast.classList.add('show'), 10);

    // หายไปหลังจาก 2.5 วินาที
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// แก้ไขส่วน Event Listener ของปุ่ม Copy เดิม
document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-copy");
    if (!btn) return;

    const url = btn.dataset.url;
    if (!url) return;

    try {
        await navigator.clipboard.writeText(url);
        
        // 1. แจ้งเตือนด้วย Toast
        showToast("คัดลอกลิงก์เรียบร้อยแล้ว");

        // 2. Feedback ที่ตัวปุ่ม (เลือกทำทั้งสองอย่าง หรืออย่างใดอย่างหนึ่งก็ได้)
        const original = btn.innerText;
        btn.innerText = "Copied!";
        btn.classList.add("copied-active"); // เพิ่ม class เพื่อเปลี่ยนสีใน CSS

        setTimeout(() => {
            btn.innerText = original;
            btn.classList.remove("copied-active");
        }, 1500);

    } catch (err) {
        console.error("Copy failed", err);
    }
});
