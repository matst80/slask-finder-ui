import { useState } from "react";
import { cookieObject, setCookie } from "./utils";
import { Dialog } from "./components/ui/dialog";
import { atom, useAtom } from "jotai";
import { Button } from "./components/ui/button";

type CookieAcceptanceLevel = "none" | "all" | "essential";

const cookieAcceptanceAtom = atom<CookieAcceptanceLevel | null>(null);

export const useCookieAcceptance = () => {
  const [accepted, setAccepted] = useAtom(cookieAcceptanceAtom);
  const updateAccept = (value: CookieAcceptanceLevel | null) => {
    if (value === "none") {
      setCookie("ca", "", -1);
      setCookie("sfadmin", "", -1);
      setCookie("locale", "", -1);
      setCookie("cartid", "", -1);
      return;
    }
    if (value === "essential") {
      setCookie("sid", "", -1);
    }
    setCookie("ca", value ?? "", value == null ? -1 : 365);
    setAccepted(value);
  };
  if (accepted == null) {
    const cookie = cookieObject();
    if (cookie.ca == null) {
      return { accepted: null, updateAccept };
    }
    if (cookie.ca === "all") {
      setAccepted("all");
    } else {
      setAccepted("none");
    }
  }
  return { accepted, updateAccept };
};

export const CookieConsent = () => {
  const { accepted, updateAccept } = useCookieAcceptance();

  const [open, setOpen] = useState<boolean>(accepted == null);
  const handleAccept = (value: CookieAcceptanceLevel) => () => {
    updateAccept(value);
    setOpen(false);
  };
  const handleReject = () => {
    updateAccept("none");
    setOpen(false);
  };

  return (
    <Dialog open={open} setOpen={setOpen} attached="bottom">
      <div className="flex items-center justify-between p-6 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col">
            <p>
              This site uses cookies, "cartid" if you use the cart, "sid" for
              session tracking, "locale" for language selection and "sfadmin" if
              you login and "ca" for consent.
            </p>
            <p className="text-sm text-gray-500">
              By clicking "Accept" you consent to the use of cookies. You can
              also choose to reject cookies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleReject}>
              Reject
            </Button>

            <Button variant="outline" onClick={handleAccept("essential")}>
              Accept essential
            </Button>
            <Button variant="default" onClick={handleAccept("all")}>
              Accept all
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
