

// function downloadFile (){
//     const handleDownload = async () => {
//     try {
//         const response = await fetch("/download-app");

//         if (!response.ok) {
//             alert("File not found!");
//             return;
//         }
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement("a");

//         a.href = url;
//         a.download = filename;

//         a.click();
        
//         window.URL.revokeObjectURL(url);
//         } catch (err) {
//             console.error(err);
//             alert("Download failed");
//         }
//     };

//     return handleDownload;

// }

// export default downloadFile;