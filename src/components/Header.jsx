import logo_ico from '../assets/logo/_logo_AI.ico'
import headerStyle from '../assets/css/Header.module.css'
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";


function Header(){
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;
    const [open, setOpen] = useState(false);

    return (
        <div id={headerStyle.header} className="flex width100 jc-space-between items-center">
            <nav id={headerStyle.home_page}>
                <img className= {headerStyle.logo_ico} src={logo_ico} alt="logo_web" />
                <h1 className= {headerStyle.web_name}>AI_Furture</h1>
            </nav>
    
            <nav id={headerStyle.frameMenu} className="flex" style={{margin: "10px 0", paddingRight:"50px"}}>
                <ul id={headerStyle.menu_item}>
                    <li><Link className={headerStyle.styleLink} to = "/">{t("menu_bar.home")}</Link></li>
                    <li><Link className={headerStyle.styleLink} to = "/blogs">{t("menu_bar.blog")}</Link></li>s
                    <li><Link className={headerStyle.styleLink} to = "/services">{t("menu_bar.service")}</Link></li>
                    <li><Link className={headerStyle.styleLink} to = "/contact">{t("menu_bar.contact")}</Link></li>
                </ul>
                
                <nav id="btnLanguage" className="flex items-center" style={{marginLeft:"8px"}}>
                    <button className={currentLang === "en" ? headerStyle.active : headerStyle.btnLanguage} onClick={() => i18n.changeLanguage("en")}>EN</button>
                    <button className={currentLang === "vi" ? headerStyle.active : headerStyle.btnLanguage} onClick={() => i18n.changeLanguage("vi")}>VI</button>
                </nav>
            </nav>
            <button
                id={headerStyle.menuBarIcon}
                onClick={() => setOpen(!open)}
            >
                {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            {open && (
                <ul id={headerStyle.menuBar} className="flex flex-column absolute">
                    <li >
                        <Link onClick={() => setOpen(false)} className={headerStyle.styleLink} to="/">
                            {t("menu_bar.home")}
                        </Link>
                    </li>
                    <li>
                        <Link onClick={() => setOpen(false)} className={headerStyle.styleLink} to="/blogs">
                            {t("menu_bar.blog")}
                        </Link>
                    </li>
                    <li>
                        <Link onClick={() => setOpen(false)} className={headerStyle.styleLink} to="/services">
                            {t("menu_bar.service")}
                        </Link>
                    </li>
                    <li>
                        <Link onClick={() => setOpen(false)} className={headerStyle.styleLink} to="/contact">
                            {t("menu_bar.contact")}
                        </Link>
                    </li>
                </ul>
            )}
            
        </div>
        
    )

}

export default Header