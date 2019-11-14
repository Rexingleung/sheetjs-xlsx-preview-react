import React from 'react';
// import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import XLSX from 'xlsx'
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      i: 0
    }
  }
  preview() {
    if (!this.state.input) return;
    const url = this.state.input;

    this.readWorkbookFromRemoteFile(url, workbook => {
      this.readWorkbook(workbook);
    });
  }
  // 从网络上读取某个excel文件，url必须同域，否则报错
  readWorkbookFromRemoteFile(url, callback) {
    axios({
      url,
      responseType: "arraybuffer", // 设置响应体类型为arraybuffer
      method: "get"
    }).then(res => {
      var data = new Uint8Array(res.data);
      var workbook = XLSX.read(data, { type: "array" });
      if (callback) callback(workbook);
    }).catch(err => {
      if (err && this.state.i < 1) {
        let curIndex = this.state.i;
        curIndex++
        this.setState({
          i: curIndex
        }, () => {
          this.preview()
        })
      }
    })
  }
  // 将表格追加到页面节点展示
  readWorkbook(workbook) {
    var sheetNames = workbook.SheetNames; // 工作表名称集合
    var worksheet = workbook.Sheets[sheetNames[0]]; // 这里我们只读取第一张sheet
    var csv = XLSX.utils.sheet_to_csv(worksheet);
    document.getElementById("result").innerHTML = this.csv2table(csv);
  }
  // 将csv转换成表格
  csv2table(csv) {
    var html = "<table>";
    var rows = csv.split("\n");
    rows.pop(); // 最后一行没用的
    rows.forEach(function (row, idx) {
      var columns = row.split(",");
      columns.unshift(idx + 1); // 添加行索引
      if (idx === 0) {
        // 添加列索引
        html += "<tr>";
        for (var i = 0; i < columns.length; i++) {
          html +=
            "<th>" +
            (i === 0 ? "" : String.fromCharCode(65 + i - 1)) +
            "</th>";
        }
        html += "</tr>";
      }
      html += "<tr>";
      columns.forEach(function (column) {
        html += "<td>" + column + "</td>";
      });
      html += "</tr>";
    });
    html += "</table>";
    return html;
  }
  changeInput(e) {
    this.setState({
      input: e.target.value
    })
  }
  render() {
    return (
      <div>
        <div className="preview-btn">
          <span className="preview" onClick={() => { this.preview() }}>点击预览</span>
          <input placeholder="请输入地址" type="text" onBlur={(e) => { this.changeInput(e) }} onChange={(e) => { this.changeInput(e) }} />
        </div>
        <div id='result'></div>
      </div>
    )
  }
}

export default App;
