// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

const printReport = async (title, ref, ratio = 0.5) => {
    window.print();
    
    // const input = ref.current;
    // const canvas = await html2canvas(input, {scale: ratio * window.devicePixelRatio});
    // const imgData = canvas.toDataURL("image/png");
    // const pdf = new jsPDF({orientation: "landscape"});
    // pdf.addImage(imgData, "png", 10, 10);
    // pdf.save(title + ".pdf");
};

export default printReport;