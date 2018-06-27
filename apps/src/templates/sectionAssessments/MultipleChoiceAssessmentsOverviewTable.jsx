import React, {Component, PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import i18n from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import MultipleChoiceAnswerCell from './MultipleChoiceAnswerCell';
import styleConstants from "@cdo/apps/styleConstants";
import { multipleChoiceDataPropType } from './assessmentDataShapes';

export const COLUMNS = {
  QUESTION: 0,
};

const ANSWER_COLUMN_WIDTH = 70;
const PADDING = 20;

const styles = {
  answerColumnHeader: {
    width: ANSWER_COLUMN_WIDTH,
    textAlign: 'center',
  },
  answerColumnCell: {
    width: ANSWER_COLUMN_WIDTH,
  },
  questionCell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }
};

const NOT_ANSWERED = 'notAnswered';

const answerColumnsFormatter = (percentAnswered, {rowData, columnIndex, rowIndex, property}) => {
  let percentValue = 0;
  const answerResults = rowData.answers[columnIndex - 1] || {};

  if (property === NOT_ANSWERED) {
     percentValue = Math.round((rowData.notAnswered / rowData.totalAnswered) * 100);
  } else {
     percentValue = Math.round((answerResults.numAnswered / rowData.totalAnswered) * 100);
  }

  return (
      <MultipleChoiceAnswerCell
        id={rowData.id}
        percentValue={percentValue}
        isCorrectAnswer={!!answerResults.isCorrect}
      />
  );
};

const questionFormatter = (question, {rowData, columnIndex, rowIndex, property}) => {
  return (
    <div>{`${rowData.questionNumber}. ${question}`}</div>
  );
};

/**
 *  A single table that shows students' responses to each multiple choice question.
 * The table displays the percent of students that select an answer choice and
 * percent of students that did not answer the question.
 */
class MultipleChoiceAssessmentsOverviewTable extends Component {
  static propTypes= {
    questionAnswerData: PropTypes.arrayOf(multipleChoiceDataPropType),
  };

  state = {
    [COLUMNS.QUESTION]: {
      direction: 'desc',
      position: 0
    }
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  onSort = (selectedColumn) => {
    this.setState({
      sortingColumns: sort.byColumn({
        sortingColumns: this.state.sortingColumns,
        // Custom sortingOrder removes 'no-sort' from the cycle
        sortingOrder: {
          FIRST: 'asc',
          asc: 'desc',
          desc: 'asc'
        },
        selectedColumn
      })
    });
  };

  getNotAnsweredColumn = () => (
    {
      property: NOT_ANSWERED,
      header: {
        label: i18n.notAnswered(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...styles.answerColumnHeader,
          }
        },
      },
      cell: {
        format: answerColumnsFormatter,
        props: {style: tableLayoutStyles.cell},
      }
    }
  );

  getAnswerColumn = (columnLabel) => (
    {
      property: 'percentAnswered',
      header: {
        label: columnLabel,
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...styles.answerColumnHeader,
          }
        },
      },
      cell: {
        format: answerColumnsFormatter,
        props: {
          style: {
            ...tableLayoutStyles.cell,
            ...styles.answerColumnCell,
          }
        },
      }
    }
  );

  getQuestionColumn = (sortable, numAnswers) => (
    {
      property: 'question',
      header: {
        label: i18n.question(),
        props: {style: tableLayoutStyles.headerCell},
      },
      cell: {
        format: questionFormatter,
        props: {
          style: {
            ...tableLayoutStyles.cell,
            ...styles.questionCell,
            maxWidth: styleConstants['content-width'] - (numAnswers * (ANSWER_COLUMN_WIDTH + PADDING)),
          }
        },
      }
    }
  );

  getColumns = (sortable) => {
    const maxOptionsQuestion = [...this.props.questionAnswerData].sort((question1, question2) => (
      question1.answers.length - question2.answers.length
    )).pop();

    const columnLabelNames = maxOptionsQuestion.answers.map((answer) => {
      return this.getAnswerColumn(answer.multipleChoiceOption);
    });

    const numAnswerColumns = columnLabelNames.length + 1;
    return [
      this.getQuestionColumn(sortable, numAnswerColumns),
      ...columnLabelNames,
      this.getNotAnsweredColumn(),
    ];

  };

  render() {
    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, sortableOptions);
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy,
    })(this.props.questionAnswerData);

    return (
      <Table.Provider
        columns={columns}
        style={tableLayoutStyles.table}
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="id" />
      </Table.Provider>
    );
  }
}

export default MultipleChoiceAssessmentsOverviewTable;
