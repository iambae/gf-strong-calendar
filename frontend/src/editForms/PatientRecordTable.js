import React from "react";
import ReactTable from "react-table";
import AreYouSure from "../modals/AreYouSure";

const columns = [
    {
        Header: "Diagnosis",
        accessor: "diagnosis",
    },
    {
        Header: "Admission",
        accessor: "admissionDate",
    },
    {
        Header: "Discharge",
        accessor: "dischargeDate",
    },
    {
        Header: "Interrupt",
        accessor: "interruptionDays",
    },
    {
        Header: "Program",
        accessor: "program",
    },
    {
        Header: "Setting",
        accessor: "setting",
    },
    {
        Header: "Category",
        accessor: "category",
    },
    {
        Header: "Comments",
        accessor: "comments",
    },
];
export default class PatientRecordTable extends React.Component {
    // TODO: We might want to default to a record that is not archived, if one exists
    state = {
        selectedRecord: this.props.records[0],
        selectedIndex: 0,
        showModal: false,
        maybeRow: null,
    }

    changeSelectedRow = rowInfo => {
        if (this.state.selectedIndex === rowInfo.index) return null;
        this.setState(() => ({
            selectedRecord: rowInfo.row,
            selectedIndex: rowInfo.index,
            maybeRow: null,
            showModal: false,
        }));

        this.props.updateSelectedRecord(rowInfo);
    }

    onChangeSelectedRow = rowInfo => {
        // check if there are unsaved changes
        let unsaved = this.props.changeRowClicked();
        if (unsaved) {
            this.setState(() => ({ showModal: true, maybeRow: rowInfo }));
        } else {
            this.changeSelectedRow(rowInfo);
        }
    }

    handleHide = () => {
        this.setState(() => ({
            showModal: false,
        }));
    }

    render() {
        const records = this.props.records;
        return (
            <React.Fragment>
                {this.state.showModal && (
                    <AreYouSure
                        onHide={this.handleHide}
                        onConfirm={this.changeSelectedRow.bind(
                            this,
                            this.state.maybeRow
                        )}
                        modalBody={this.props.modalBody}
                    />
                )}
                <ReactTable
                    data={records}
                    columns={columns}
                    pageSizeOptions={[5, 10]}
                    defaultPageSize={5}
                    className="-striped -highlight"
                    getTrProps={(_, rowInfo) => {
                        if (rowInfo && rowInfo.row) {
                            const archived = records[rowInfo.index].archived;
                            return {
                                onClick: archived
                                    ? () => {}
                                    : () => {
                                        this.onChangeSelectedRow(rowInfo);
                                    },
                                style: {
                                    background: archived
                                        ? "#808080"
                                        : rowInfo.index ===
                                          this.state.selectedIndex
                                            ? "#B3D2DC"
                                            : "white",
                                    color:
                                        rowInfo.index ===
                                        this.state.selectedIndex
                                            ? "white"
                                            : "black",
                                },
                            };
                        } else {
                            return {};
                        }
                    }}
                />
            </React.Fragment>
        );
    }
}
