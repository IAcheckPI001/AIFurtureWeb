


import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "../assets/css/Services.module.css"
import pauseIco from "../assets/icon/pause-button.png"
import playIco from "../assets/icon/play-button.png"
import switchIco from "../assets/icon/switchIco.png"
import warningIco from "../assets/icon/warningIco.png"
import detectIco from "../assets/icon/detectIco.png"
import settingsIco from "../assets/icon/settingsIco.png"

function Services (){

    const { t } = useTranslation();
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [checkUpdateSerivce, setCheckUpdate] = useState(false);

    const handleToggle = () => {
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleCheckUpdate = (e) => {
        setCheckUpdate(true);
    }

    const showDemo = () => {
        const videoDemo = document.getElementById("arp-id00-frame");
        if (!videoDemo) return;

        if (videoDemo.style.display === "flex") {
            videoDemo.style.display = "none";
        } else {
            videoDemo.style.display = "flex";
        }
    }

    const handleScroll = () => {
        const section2 = document.getElementById("section-0");
        section2.scrollIntoView({ behavior: "smooth" });
    }

    return (
        <div className="container flex flex-column">
            <div id={styles.inforFrame}>
                <div className="flex flex-column height-100 relative">
                    <video ref={videoRef} className="width-100 absolute" style={{height:"97%",width:"98%", paddingTop:"12px"}} autoPlay muted loop playsInline>
                        <source src="https://res.cloudinary.com/dhbcyrfmw/video/upload/v1758181344/Service_ik6vmu.mp4" type="video/mp4"/>
                    </video>
                    <div className={styles.frameInfor}>
                        <h1 style={{color: "#0f9880", fontSize:"58px"}}>{t("service_page.titleInfor")}</h1>
                        <p style={{color: "rgb(0 29 17)", fontSize:"20px", marginTop:"18px"}}>{t("service_page.description")}</p>
                        <button className={styles.button} onClick={handleScroll}>{t("service_page.btnView")}</button>
                    </div>
                </div>
            </div>
            <section id="section-0" className="flex jc-space-around">
                <div className="flex jc-space-around items-center" style={{width: "68vw", padding: "25px", paddingBottom:"0", borderRadius:"5px"}}>
                    <div className="flex flex-column">
                        <h2 style={{marginBottom:"8px"}}>ARP Cache Security</h2>
                        <p style={{marginBottom:"28px", marginRight:"18px", marginLeft:"0"}}>{t("ARPSoftware.descriptionARP")}
                        </p>
                        <div className="flex" style={{justifyContent:"jc-start"}}>
                            <button className={styles.downButton} name="infor" onClick={handleCheckUpdate}>{t("service_page.btnDownload")}</button>
                            <button style={{marginLeft:"14px"}} className={styles.inforButton} onClick={showDemo} name="down-id00">{t("service_page.btnDemo")}</button>
                        </div>
                        {checkUpdateSerivce && (
                            <span id="notifyService" style={{marginTop:"10px", color:"#7682edff"}}>Dịch vụ đang được tích hợp, sẽ sớm được ra mắt</span>
                        )}
                    </div>
                    <div style={{maxHeight: "350px"}}>
                        <img style={{height: "40vh", borderRadius:"5px"}} src="https://res.cloudinary.com/dhbcyrfmw/image/upload/v1758181372/ARP_Frameapp1_obt1tv.png" alt="" />
                    </div>
                </div>
            </section>
            <div id="arp-id00-frame" style={{display: "none"}} className="flex flex-column items-center width-100 hidden">
                <video ref={videoRef} id="arp-id00" style={{height:"52vh", borderRadius:"5px", marginBottom:"20px"}} autoPlay muted loop playsInline>
                    <source src="https://res.cloudinary.com/dhbcyrfmw/video/upload/v1758181342/ARP_Service_tv7nh0.mp4" type="video/mp4"/>
                </video>
                <button style={{width:"auto", margin:"20px 0", padding:" 8px 12px", borderRadius: "5px", border: "1px solid #dfdfdf", backgroundColor: "rgb(255 255 255 / 88%)", fontSize:"13px", cursor: "pointer"}} 
                    className={isPlaying ? "pauseBtn" : "resumeBtn"} 
                    onClick={handleToggle}> 
                    {isPlaying ? 
                        <div className="flex items-center">
                            <img style={{width:"16px", height:"16px", marginRight:"5px"}} src={pauseIco} alt="" />
                            <span style={{fontSize:"16px"}}>{t("service_page.pauseDemo")}</span>
                        </div> 
                        : 
                        <div className="flex items-center">
                            <img style={{width:"14px", height:"14px", marginRight:"5px"}} src={playIco} alt="" />
                            <span style={{fontSize:"16px"}}>{t("service_page.resumeDemo")}</span>
                        </div>
                    }
                </button>
            </div>
            <div className="flex jc-space-around width-100" style={{marginTop:"20px", marginBottom:"25px"}}>
                <div className="flex flex-column jc-space-around" style={{width:"54vw", marginLeft:"26px", borderTop:"1px solid #dfdfdf"}}>
                    <div className="flex flex-row items-baseline" style={{marginBottom:"12px"}}>
                        <ul className="flex flex-column flex-col-1" style={{marginRight:"58px", width:"80%", listStyle:"none", padding:"inherit"}}>
                            <li className={styles.listBenefit}>
                                <div className="flex flex-column">
                                    <img className={styles.icoBenefit} src={detectIco} alt="" />
                                    <h3 style={{marginBottom:"16px"}}>{t("ARPSoftware.benefit_1")}</h3>
                                </div>
                            </li>
                            <li className={styles.listBenefit}>
                                <p className={styles.description}>{t("ARPSoftware.content_1")}</p>
                            </li>
                        </ul>
                        <ul className="flex flex-column flex-col-1" style={{marginRight:"15px", width:"80%", marginTop:"23px", listStyle:"none", padding:"inherit"}}>
                            <li className={styles.listBenefit}>
                                <div className="flex flex-column">
                                    <img className={styles.icoBenefit} src={switchIco} alt="" />
                                    <h3 style={{marginBottom:"16px"}}>{t("ARPSoftware.benefit_2")}</h3>
                                </div>
                            </li>
                            <li className={styles.listBenefit}>
                                <p className={styles.description}>{t("ARPSoftware.content_2")}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="flex flex-row items-baseline">
                        <ul className="flex flex-column flex-col-1" style={{marginRight:"58px", width:"80%", listStyle:"none", padding:"inherit"}}>
                            <li className={styles.listBenefit}>
                                <div className="flex flex-column">
                                    <img className={styles.icoBenefit} src={warningIco} alt="" />
                                    <h3 style={{marginBottom:"16px"}}>{t("ARPSoftware.benefit_3")}</h3>
                                </div>
                            </li>
                            <li className={styles.listBenefit}>
                                <p className={styles.description}>{t("ARPSoftware.content_3")}</p>
                            </li>
                        </ul>
                        <div className="flex flex-column flex-col-1" style={{marginRight:"15px", width:"80%", marginTop:"23px", listStyle:"none", padding:"inherit"}}>
                            <li className={styles.listBenefit}>
                                <div className="flex flex-column">
                                    <img className={styles.icoBenefit} src={settingsIco} alt="" />
                                    <h3 style={{marginBottom:"16px"}}>{t("ARPSoftware.benefit_4")}</h3>
                                </div>
                            </li>
                            <li className={styles.listBenefit}><p className={styles.description}>{t("ARPSoftware.content_4_a")}</p></li>
                            <li className={styles.listBenefit}><p className={styles.description}>{t("ARPSoftware.content_4_b")}</p></li>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Services;