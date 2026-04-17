import AllProductsPage from "./AllProductsPage";

const mrProductFilters = [
    { id: "pending-mr", label: "Pending MR" },
    { id: "mr", label: "All MR Products" },
    { id: "approved-mr", label: "Approved MR" },
    { id: "rejected-mr", label: "Rejected MR" },
];

const MrProductRequestsPage = () => (
    <AllProductsPage
        defaultOwnershipFilter="pending-mr"
        filterOptions={mrProductFilters}
        hideAddButton
        pageTitle="MR Product Requests"
        pageDescription="Review products submitted by MRs and approve or reject them."
    />
);

export default MrProductRequestsPage;
