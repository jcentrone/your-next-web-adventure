import React from "react";
import {CoverTemplateProps} from "./types";

const CoverTemplateOne: React.FC<CoverTemplateProps> = ({
                                                            reportTitle,
                                                            coverImage,
                                                            organizationName,
                                                            organizationAddress,
                                                            organizationPhone,
                                                            organizationEmail,
                                                            organizationWebsite,
                                                            organizationLogo,
                                                            inspectorName,
                                                            inspectorLicenseNumber,
                                                            inspectorPhone,
                                                            inspectorEmail,
                                                            clientName,
                                                            clientAddress,
                                                            clientEmail,
                                                            clientPhone,
                                                            inspectionDate,
                                                            weatherConditions,
                                                        }) => (
    <div
        className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-500 to-sky-400 text-white flex flex-col items-center justify-center p-10">
        {organizationLogo && <img src={organizationLogo} alt="" className="h-16 mb-4 object-contain"/>}
        <h1 className="text-4xl md:text-5xl font-bold text-center">{reportTitle}</h1>
        <p className="mt-2 opacity-90">{organizationName}</p>

        <div className="mt-6 rounded-full overflow-hidden border-4 border-white">
            {coverImage ? (
                <img src={coverImage} alt="" className="w-40 h-40 object-cover"/>
            ) : (
                <div className="w-40 h-40 bg-white/20"/>
            )}
        </div>

        <div className="mt-8 grid gap-6 w-full max-w-4xl md:grid-cols-2">
            <div className="bg-white/10 backdrop-blur-sm rounded p-4">
                <h3 className="font-semibold mb-2">Inspector</h3>
                {inspectorName && <p>Name: {inspectorName}</p>}
                {inspectorLicenseNumber && <p>License: {inspectorLicenseNumber}</p>}
                {inspectorPhone && <p>Phone: {inspectorPhone}</p>}
                {inspectorEmail && <p>Email: {inspectorEmail}</p>}
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded p-4">
                <h3 className="font-semibold mb-2">Client</h3>
                {clientName && <p>Name: {clientName}</p>}
                {clientAddress && <p>Address: {clientAddress}</p>}
                {clientPhone && <p>Phone: {clientPhone}</p>}
                {clientEmail && <p>Email: {clientEmail}</p>}
            </div>
        </div>

        <div className="mt-6 text-sm text-center">
            {inspectionDate && <p>Inspection Date: {inspectionDate}</p>}
            {weatherConditions && <p>Weather: {weatherConditions}</p>}
        </div>

        {(organizationAddress || organizationPhone || organizationEmail || organizationWebsite) && (
            <div className="mt-6 text-sm text-center opacity-90">
                {organizationAddress && <p>{organizationAddress}</p>}
                {(organizationPhone || organizationEmail || organizationWebsite) && (
                    <p>
                        {organizationPhone && <span>{organizationPhone}</span>}
                        {organizationPhone && (organizationEmail || organizationWebsite) && <span> • </span>}
                        {organizationEmail && <span>{organizationEmail}</span>}
                        {organizationEmail && organizationWebsite && <span> • </span>}
                        {organizationWebsite && <span>{organizationWebsite}</span>}
                    </p>
                )}
            </div>
        )}
    </div>
    // <div className="flex flex-col items-center text-center p-10 space-y-6">
    //     {coverImage && (
    //         <img
    //             src={coverImage}
    //             alt=""
    //             className="w-full max-h-64 object-cover rounded"
    //         />
    //     )}
    //     <h1 className="text-4xl font-bold">{reportTitle}</h1>
    //     {organizationLogo && (
    //         <img
    //             src={organizationLogo}
    //             alt=""
    //             className="h-20 object-contain"
    //         />
    //     )}
    //     <div className="text-sm">
    //         {organizationName && <p className="font-semibold">{organizationName}</p>}
    //         {organizationAddress && <p>{organizationAddress}</p>}
    //         {organizationPhone && <p>{organizationPhone}</p>}
    //         {organizationEmail && <p>{organizationEmail}</p>}
    //         {organizationWebsite && <p>{organizationWebsite}</p>}
    //     </div>
    //     <div className="grid grid-cols-2 gap-8 w-full max-w-3xl text-left text-sm">
    //         <div>
    //             <h2 className="font-semibold mb-2 text-center">Inspector</h2>
    //             {inspectorName && <p>Name: {inspectorName}</p>}
    //             {inspectorLicenseNumber && <p>License: {inspectorLicenseNumber}</p>}
    //             {inspectorPhone && <p>Phone: {inspectorPhone}</p>}
    //             {inspectorEmail && <p>Email: {inspectorEmail}</p>}
    //         </div>
    //         <div>
    //             <h2 className="font-semibold mb-2 text-center">Client</h2>
    //             {clientName && <p>Name: {clientName}</p>}
    //             {clientAddress && <p>Address: {clientAddress}</p>}
    //             {clientPhone && <p>Phone: {clientPhone}</p>}
    //             {clientEmail && <p>Email: {clientEmail}</p>}
    //         </div>
    //     </div>
    //     <div className="text-sm">
    //         {inspectionDate && <p>Inspection Date: {inspectionDate}</p>}
    //         {weatherConditions && <p>Weather: {weatherConditions}</p>}
    //     </div>
    // </div>
);

export default CoverTemplateOne;