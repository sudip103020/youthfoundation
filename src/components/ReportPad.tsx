import React from "react";
import "./ReportPad.css";

interface ReportPadProps {
  refNo?: string;
  date?: string;
  title?: string;
  subject?: string;

  greeting?: string;
  content?: string;

  total?: string | number;

  presidentName?: string;
  secretaryName?: string;
}

const ReportPad: React.FC<ReportPadProps> = ({
  refNo,
  date,
  title,
  content,
  presidentName,
  secretaryName,
}) => {

  /* =====================================================
     CLEAN CONTENT
     Firebase description-এর ভিতরে থাকা extra
     empty paragraph / div / br remove করবে
  ===================================================== */

  const cleanContent = (html?: string) => {
    if (!html) return "";

    let cleaned = html;

    // Empty paragraph remove
    cleaned = cleaned.replace(
      /<p[^>]*>\s*(?:<br\s*\/?>|\s|&nbsp;)*<\/p>/gi,
      ""
    );

    // Empty div remove
    cleaned = cleaned.replace(
      /<div[^>]*>\s*(?:<br\s*\/?>|\s|&nbsp;)*<\/div>/gi,
      ""
    );

    // শুরুতে থাকা অতিরিক্ত <br> remove
    cleaned = cleaned.replace(
      /^(?:\s*<br\s*\/?>\s*)+/gi,
      ""
    );

    // শেষে থাকা অতিরিক্ত <br> remove
    cleaned = cleaned.replace(
      /(?:\s*<br\s*\/?>\s*)+$/gi,
      ""
    );

    return cleaned.trim();
  };

  const formattedContent = cleanContent(content);

  return (
    <div className="report-wrapper">

      <div className="report-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="report-header">

          <div className="header-main">

            {/* LOGO */}
            <div className="header-logo-box">
              <img
                src="/logo.png"
                alt="Badokhali Youth Foundation"
                className="report-logo"
              />
            </div>

            {/* ORGANIZATION NAME */}
            <div className="header-title">

              <div className="bangla-name">
                বাদোখালী ইয়ুথ ফাউন্ডেশন
              </div>

              <div className="english-name">
                Badokhali Youth Foundation
              </div>

            </div>

            {/* SLOGAN */}
            <div className="header-slogan">
              তারুণ্যের স্পন্দন , সেবার বন্ধন
            </div>

          </div>

          {/* HEADER BOTTOM DESIGN */}
          <div className="header-design">

            <div className="design-left"></div>

            <div className="design-blue"></div>

            <div className="design-right"></div>

          </div>

        </header>


        {/* =================================================
            WATERMARK
        ================================================= */}

        <div className="watermark">
          <img src="/logo.png" alt="" />
        </div>


        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="report-content">

          {/* REF + DATE */}
          <div className="report-meta">

            <div>
              <span>স্মারক নং:</span>
              <strong>{refNo}</strong>
            </div>

            <div>
              <span>তারিখ:</span>
              <strong>{date}</strong>
            </div>

          </div>


          {/* TITLE */}

          {title && (
            <h1 className="report-title">
              {title}
            </h1>
          )}


          {/* BODY */}

          {formattedContent && (
            <div
              className="report-body"
              dangerouslySetInnerHTML={{
                __html: formattedContent,
              }}
            />
          )}


          {/* =================================================
              SIGNATURE + SEAL
          ================================================= */}

          <div className="signature-area">

            {/* SEAL - LEFT */}

            <div className="official-seal">

              <img
                src="/roundseal.png"
                alt="Official Seal"
              />

            </div>


            {/* SIGNATURE - RIGHT */}

            <div className="signatures">

              <div className="signature">

                

                <strong>
                  {presidentName}
                </strong>

                <span>
                  {secretaryName}
                </span>

                <span>
                  বাদোখালী ইয়ুথ ফাউন্ডেশন
                </span>

              </div>

            </div>

          </div>

        </main>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="report-footer">

          {/* ELECTRONIC NOTICE */}

          <div
            style={{
              borderTop: "1px solid #d5d5d5",
              marginTop: "0",
              paddingTop: "8px",
              textAlign: "center",
              fontSize: "10px",
              color: "#888",
            }}
          >
            “This is electronically generated. No signature is required.”
          </div>


          {/* FOOTER INFORMATION */}

          <div className="footer-info">

            {/* PHONE */}

            <div className="footer-item">

              <div className="footer-icon">
                ☎
              </div>

              <div>
                <div>+8801738126875</div>
                <div>+8801714597343</div>
              </div>

            </div>


            {/* ADDRESS */}

            <div className="footer-item">

              <div className="footer-icon">
                📍
              </div>

              <div>
                Badokhali, Mograhat-9300,
                <br />
                Bagerhat
              </div>

            </div>


            {/* EMAIL / YOUTUBE */}

            <div className="footer-item">

              <div className="footer-icon">
                ✉
              </div>

              <div>
                badokhaliyouthfoundation@gmail.com
                <br />
                youtube.com/@badokhaliyyouthfoundation
              </div>

            </div>


            {/* QR CODE */}

            <div className="qr-wrapper">

              <img
                src="/qr-code.jpeg"
                alt="QR Code"
              />

            </div>

          </div>


          {/* FOOTER DESIGN */}

          <div className="footer-decoration">

            <span></span>
            <span></span>
            <span></span>

          </div>

        </footer>

      </div>

    </div>
  );
};

export default ReportPad;

