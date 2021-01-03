import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { Comparator, dateFilter } from 'react-bootstrap-table2-filter'
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import _ from 'lodash';
import faker from 'faker/locale/en_US';
import moment from 'moment';

import {
    Badge,
    Button,
    CustomInput,
    StarRating,
    ButtonGroup
} from '../../../../app/components';
import { CustomExportCSV } from '../../Tables/components/CustomExportButton';
import { CustomSearch } from '../../Tables/components/CustomSearch';
import { CustomPaginationPanel } from '../../Tables/components/CustomPaginationPanel';
import { CustomSizePerPageButton } from '../../Tables/components/CustomSizePerPageButton';
import { CustomPaginationTotal } from '../../Tables/components/CustomPaginationTotal';
import { randomArray } from '../../../utilities';
import {
    buildCustomTextFilter,
    buildCustomSelectFilter,
    buildCustomNumberFilter
} from '../../../../app/routes/Tables/ExtendedTable/filters/index';
import { Link } from 'react-router-dom';
import DateFormat from '../../../utilities/dateformat';
import Fetcher from '../../../utilities/fetcher';
import port from '../../../port';

const INITIAL_PRODUCTS_COUNT = 500;

const CampaignStatus = {
    Publish: true,
    Unpublish: false
};

const sortCaret = (order) => {
    if (!order)
        return <i className="fa fa-fw fa-sort text-muted"></i>;
    if (order)
        return <i className={`fa fa-fw text-muted fa-sort-${order}`}></i>
}


export class CampaignField extends React.Component {
    constructor() {
        super();
        
        this.state = {
            //products: _.times(INITIAL_PRODUCTS_COUNT, generateRow),
            selected: [],
            loading : true,
            campaigns : [],
            generatedrows : [],
        };

        this.headerCheckboxRef = React.createRef();
        this.fetchData = this.fetchData.bind(this);
        this.generateRow = this.generateRow.bind(this);
    }

    componentDidMount() {
        this.fetchData();
    };

    fetchData() {
        let self = this;
        Fetcher(`${port}/api/v1/campaigns/`).then(function(response){
            if(!response.error){
                console.log(response);
                self.setState({campaigns: response, loading: false});
                self.generateRow();
                //console.log(self.state.campaigns);
            }
        });
    }

    generateRow(){
        let self = this;

        const campaigns = self.state.campaigns.map(function (camps){
            //alert(DateFormat(camps.created_at));
            return {
                id: camps.id,
                name: camps.name,
                published: camps.published,
                reward_type: camps.reward_type,
                commission_type: camps.commission_type,
                created_at: DateFormat(camps.created_at)
            }
        });
        //alert(JSON.stringify(campaigns));
        self.setState({generatedrows: campaigns});
    }

    handleSelect(row, isSelected) {
        if (isSelected) {
            this.setState({ selected: [...this.state.selected, row.id] })
        } else {
            this.setState({
                selected: this.state.selected.filter(itemId => itemId !== row.id)
            })
        }
    }

    handleSelectAll(isSelected, rows) {
        if (isSelected) {
            this.setState({ selected: _.map(rows, 'id') })
        } else {
            this.setState({ selected: [] });
        }
    }

    handleAddRow() {
        //return (
            <Link to='/create-campaign'></Link>
        //)
    }

    handleDeleteRow() {
        alert(this.state.selected);
        Fetcher(`${port}/api/v1/campaign/${this.state.selected}/delete`, 'POST').then(function(response){
            if(!response.error){
                console.log(response);
                self.setState({campaigns: response, loading: false});
                self.generateRow();
                //console.log(self.state.campaigns);
            }
        });
        /*this.setState({
            generatedrows: _.filter(this.state.generatedrows, product =>
                !_.includes(this.state.selected, product.id))
        })*/
    }

    /*handleResetFilters() {
        this.nameFilter('');
        this.qualityFilter('');
        this.rewardFilter('');
        this.commissionFilter('');
    }*/

    createColumnDefinitions() {
        return [{
            dataField: 'id',
            text: 'Product ID',
            headerFormatter: column => (
                <React.Fragment>
                    <span className="text-nowrap">{ column.text }</span>
                    
                </React.Fragment>
            )
        }, {
            dataField: 'name',
            text: 'Campaign Name',
            sort: true,
            sortCaret,
            formatter: (cell) => (
                <span className="text-inverse">
                    { cell }
                </span>
            )
            /*...buildCustomTextFilter({
                placeholder: 'Enter campaign name...',
                getFilter: filter => { this.nameFilter = filter; }
            })*/
        }, {
            dataField: 'published',
            text: 'Publish',
            formatter: (cell) => {
                let pqProps;
                switch (cell) {
                    case CampaignStatus.Publish:
                        pqProps = {
                            color: 'success',
                            text: 'True'
                        }
                    break;
                    case CampaignStatus.Unpublish:
                    default:
                        pqProps = {
                            color: 'danger',
                            text: 'False'
                        }
                }

                return (
                    <Badge color={pqProps.color}>
                        { pqProps.text }
                    </Badge>
                )
            },
            sort: true,
            sortCaret
            /*...buildCustomSelectFilter({
                placeholder: 'Select Status',
                options: [
                    { value: CampaignStatus.Publish, label: 'True' },
                    { value: CampaignStatus.Unpublish, label: 'False' }
                ],
                getFilter: filter => { this.qualityFilter = filter; }
            })*/
        }, {
            dataField: 'reward_type',
            text: 'Reward Type',
            sort: true,
            sortCaret
            /*...buildCustomTextFilter({
                placeholder: 'Enter reward type...',
                getFilter: filter => { this.rewardFilter = filter; }
            })*/
        }, {
            dataField: 'commission_type',
            text: 'Commission Type',
            sort: true,
            sortCaret
               /* ...buildCustomTextFilter({
                    placeholder: 'Enter Commission type...',
                    getFilter: filter => { this.commissionFilter = filter; }
                })*/
        }, {
            dataField: 'created_at',
            text: 'Date Created',
            formatter: (cell) =>
                moment(cell).format('DD/MM/YYYY'),
            /*filter: dateFilter({
                className: 'd-flex align-items-center',
                comparatorClassName: 'd-none',
                dateClassName: 'form-control form-control-sm',
                comparator: Comparator.GT,
                getFilter: filter => { this.stockDateFilter = filter; }
            }),*/
            sort: true,
            sortCaret
        }]; 
    }

    render() {
        if(this.state.loading === false){
            const columnDefs = this.createColumnDefinitions();
            const paginationDef = paginationFactory({
                paginationSize: 5,
                showTotal: true,
                pageListRenderer: (props) => (
                    <CustomPaginationPanel {...props} size="sm" className="ml-md-auto mt-2 mt-md-0" />
                ),
                sizePerPageRenderer: (props) => (
                    <CustomSizePerPageButton {...props} />
                ),
                paginationTotalRenderer: (from, to, size) => (
                    <CustomPaginationTotal {...{ from, to, size }} />
                )
            });
            const selectRowConfig = {
                mode: 'checkbox',
                selected: this.state.selected,
                onSelect: this.handleSelect.bind(this),
                onSelectAll: this.handleSelectAll.bind(this),
                selectionRenderer: ({ mode, checked, disabled }) => (
                    <CustomInput type={mode} checked={checked} disabled={disabled} />
                ),
                selectionHeaderRenderer: ({ mode, checked, indeterminate }) => (
                    <CustomInput type={mode} checked={checked} innerRef={el => el && (el.indeterminate = indeterminate)} />
                )
            };

            return (
                <ToolkitProvider
                    keyField="id"
                    data={this.state.generatedrows}
                    columns={columnDefs}
                    search
                    exportCSV
                >
                    {
                        props => (
                            <React.Fragment>
                                <div className="d-flex justify-content-end align-items-center mb-2">
                                    <h6 className="my-0">
                                        Campaign
                            </h6>
                                    <div className="d-flex ml-auto">
                                        <CustomSearch
                                            className="mr-2"
                                            {...props.searchProps}
                                        />
                                        <ButtonGroup>
                                            <CustomExportCSV
                                                {...props.csvProps}
                                            >
                                                Export
                                    </CustomExportCSV>
                                            <Button
                                                size="sm"
                                                outline
                                                onClick={this.handleDeleteRow.bind(this)}
                                            >
                                                Delete
                                    </Button>
                                            <Button
                                                size="sm"
                                                outline
                                                onClick={this.handleAddRow.bind(this)}
                                            >
                                                <i className="fa fa-fw fa-plus"></i>
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </div>
                                <BootstrapTable
                                    classes="table-responsive"
                                    pagination={paginationDef}
                                    //filter={filterFactory()}
                                    selectRow={ selectRowConfig }
                                    bordered={false}
                                    responsive
                                    {...props.baseProps}
                                />
                            </React.Fragment>
                        )
                    }
                </ToolkitProvider>
            );
        } else{
            return(
                <p>Loading</p>
            )
        }
        
    }
}