import NavigationCard, { ProfileNavigationCard } from "./NavigationCard";

export default function Layout ({children,hideNavigation}) {
  let rightColumnClasses = '';
  if (hideNavigation) {
    rightColumnClasses += 'w-full';
  } else {
    rightColumnClasses += 'mx-4 md:mx-0 md:w-9/12';
  }
  return (
    <div className="md:flex mt-4 max-w-4xl mx-auto gap-6 mb-24 md:mb-0">
      {!hideNavigation && (
        <div className="fixed md:static w-full bottom-0 md:w-3/12 -mb-5">
          <NavigationCard />
        </div>
      )}
      <div className={rightColumnClasses}>
        {children}
      </div>
    </div>
  );
}

export function PlanetLayout ({children,hideNavigation}) {
  let rightColumnClasses = '';
  if (hideNavigation) {
    rightColumnClasses += 'w-full';
  } else {
    rightColumnClasses += 'mx-4 md:mx-0 md:w-9/12';
  }
  return (
    <center><div className=" mt-4 max-w-5xl mx-10 gap-2 mb-0 md:mb-0 w-full">
      {!hideNavigation && (
        <div className="fixed md:static w-full bottom-0 md:w-3/12 -mb-5">
          <NavigationCard />
        </div>
      )}
      <div className={rightColumnClasses}>
        {children}
      </div>
    </div></center>
  );
}

export function ProfileLayout({children,hideNavigation}) {
  let rightColumnClasses = '';
  if (hideNavigation) {
    rightColumnClasses += 'w-full';
  } else {
    rightColumnClasses += 'mx-4 md:mx-0 md:w-9/12';
  }
  return (
    <div className="md:flex mt-4 max-w-4xl mx-auto gap-6 mb-24 md:mb-0">
      {!hideNavigation && (
        <div className="fixed md:static w-full bottom-0 md:w-3/12 -mb-5">
          <ProfileNavigationCard /> {/* Hide second nav behind drawer on mobile view */}
        </div>
      )}
      <div className={rightColumnClasses}>
        {children}
      </div>
    </div>
  );
}