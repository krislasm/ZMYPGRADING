var NHView = null;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV'
], function (Controller, MessageBox, JSONModel, Export, ExportTypeCSV) {
	"use strict";

	return Controller.extend("zmypgrading.controller.historical", {
		onInit: function () {
			// Router initialization and Match event handeler 
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("historical").attachMatched(this._initialize, this);
		},
		_initialize: function (oEvent) {
			NHView = this;
			NHView.oArgs = oEvent.getParameter("arguments");
			NHView.sUrl = "/sap/opu/odata/sap/ZGW_SWA_GRADE_SRV/";
			sap.ui.core.BusyIndicator.show();
			//Setting Page Title 
			NHView.byId("headerLabel").setTitle("Historical Data for " + NHView.oArgs.year + ", " + NHView.oArgs.tname + ", " + NHView.oArgs.name +
				", " + NHView.oArgs.grd +
				".");
			//oData Model Defination
			NHView.oDataModel = new sap.ui.model.odata.v2.ODataModel(NHView.sUrl, {
				json: true,
				loadMetadataAsync: true
			});
			//Filter for oData call to get Table Header
			var a = [],
				b = [],
				c = [],
				d = [],
				e = [],
				f = [],
				g = [],
				h = [];
				
			if(NHView.oArgs.uname === "X")
			{
				NHView.oArgs.uname = "";
			}
			a.push(new sap.ui.model.Filter("Year", sap.ui.model.FilterOperator.EQ, NHView.oArgs.year));
			b.push(new sap.ui.model.Filter("Term", sap.ui.model.FilterOperator.EQ, NHView.oArgs.term));
			c.push(new sap.ui.model.Filter("SubjectID", sap.ui.model.FilterOperator.EQ, NHView.oArgs.subject));
			d.push(new sap.ui.model.Filter("Binding", sap.ui.model.FilterOperator.EQ, 'X'));
			e.push(new sap.ui.model.Filter("YEAR", sap.ui.model.FilterOperator.EQ, NHView.oArgs.year));
			f.push(new sap.ui.model.Filter("TERM", sap.ui.model.FilterOperator.EQ, NHView.oArgs.term));
			g.push(new sap.ui.model.Filter("FieldName", sap.ui.model.FilterOperator.EQ, NHView.oArgs.uname));
			h.push(new sap.ui.model.Filter("STUDENT_NAME", sap.ui.model.FilterOperator.EQ, NHView.oArgs.uname));
			var filter1 = new sap.ui.model.Filter({
				filters: a,
				and: true
			});
			var filter2 = new sap.ui.model.Filter({
				filters: b,
				and: true
			});
			var filter3 = new sap.ui.model.Filter({
				filters: c,
				and: true
			});
			var filter4 = new sap.ui.model.Filter({
				filters: d,
				and: true
			});
			var filter5 = new sap.ui.model.Filter({
				filters: e,
				and: true
			});
			var filter6 = new sap.ui.model.Filter({
				filters: f,
				and: true
			});

			var filterName = new sap.ui.model.Filter({
				filters: g,
				and: true
			});
			var filterName1 = new sap.ui.model.Filter({
				filters: h,
				and: true
			});
			NHView.filter = new sap.ui.model.Filter({
				filters: [filter1, filter2, filter3, filter4, filterName],
				and: true
			});
			NHView.filter1 = new sap.ui.model.Filter({
				filters: [filter5, filter6, filter3, filterName1],
				and: true
			});
			NHView.oDataModel.read("/TableMetadataSet", {
				filters: [NHView.filter],
				success: function (oData, response) {
					var oTableHis = NHView.byId("historicalTable");
					NHView.dataModel = new JSONModel();
					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].VisibilityFlag === 'X') {
							oData.results[i].VisibilityFlag = true;
						} else {
							oData.results[i].VisibilityFlag = false;
						}

						if (oData.results[i].EditableFlag === 'X') {
							oData.results[i].EditableFlag = true;
						} else {
							oData.results[i].EditableFlag = false;
						}
					}
					NHView.dataModel.setSizeLimit(oData.results.length);
					NHView.dataModel.setData({
						"Value": oData.results
					});
					oTableHis.setModel(NHView.dataModel);
					NHView.flag = 0;
					oTableHis.bindColumns("/Value", function (index, context) {
						var template = "";

						if (context.getProperty().EditableFlag) {

							template = new sap.m.Input({
								value: "{Item>" + context.getProperty().FieldId + "}",
								tooltip: "{Item>" + context.getProperty().FieldId + "}",
								enabled: context.getProperty().EditableFlag,
								textAlign: "Right",
								width: "100%",
								change: NHView.ValidateScore
							});

						} else {

							template = new sap.m.Text({
								text: "{Item>" + context.getProperty().FieldId + "}",
								tooltip: "{Item>" + context.getProperty().FieldId + "}",
								width: "100%",
								textAlign: "Right"
							});

						}
						if (NHView.flag !== 0) {
							NHView.flag++;
							return new sap.ui.table.Column({
								id: context.getProperty().FieldId,
								label: context.getProperty().FieldName,
								tooltip: context.getProperty().FieldName,
								visible: context.getProperty().VisibilityFlag,
								sortProperty: context.getProperty().FieldId,
								width: "100px",
								template: template
							});
						} else {
							NHView.flag++;
							template = new sap.m.Text({
								text: "{Item>" + context.getProperty().FieldId + "}",
								tooltip: "{Item>" + context.getProperty().FieldId + "}",
								width: "100%",
								textAlign: "Left"
							});
							return new sap.ui.table.Column({
								id: context.getProperty().FieldId,
								label: context.getProperty().FieldName,
								tooltip: context.getProperty().FieldName,
								visible: context.getProperty().VisibilityFlag,
								textAlign: "Left",
								sortProperty: context.getProperty().FieldId,
								width: "200px",
								template: template
							});
						}
					});
					// oData Call to get Table Items
					var oDataItemModel = new sap.ui.model.odata.v2.ODataModel(NHView.sUrl, {
						json: true,
						loadMetadataAsync: true
					});
					oDataItemModel.read("/MYP_HISTORICALDATASet", {
						filters: [NHView.filter1],
						success: function (oData, response) {
							NHView.dataItemModel = new JSONModel();
							NHView.dataItemModel.setData({
								"Value": oData.results
							});
							NHView.getView().setModel(NHView.dataItemModel, "Item");
							oTableHis.bindRows("Item>/Value");
							if (oData.results.length > 10) {
								oTableHis.setVisibleRowCount(oData.results.length);
							}
							sap.ui.core.BusyIndicator.hide();
						},
						error: function (oError) {
							sap.ui.core.BusyIndicator.hide();
							var dialog_Msg = new sap.m.Dialog({
								title: 'Error',
								type: 'Message',
								state: 'Error',
								content: new sap.m.Text({
									text: 'Something Went Wrong! Please Reload the Page'
								}),
								beginButton: new sap.m.Button({
									text: 'OK',
									press: function () {
										dialog_Msg.close();
									}
								}),
								afterClose: function () {
									dialog_Msg.destroy();
								}
							});
							dialog_Msg.open();
						}
					});
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					var dialog_Msg = new sap.m.Dialog({
						title: 'Error',
						type: 'Message',
						state: 'Error',
						content: new sap.m.Text({
							text: 'Something Went Wrong! Please Reload the Page'
						}),
						beginButton: new sap.m.Button({
							text: 'OK',
							press: function () {
								dialog_Msg.close();
							}
						}),
						afterClose: function () {
							dialog_Msg.destroy();
						}
					});
					dialog_Msg.open();
				}
			});
		},
		ValidateScore: function (oEvent) {
			var grdFlag = true;
			if (oEvent) {
				if (/^[a-zA-Z0-9]*$/.test(oEvent.getSource().getValue()) === false) {
					/*if (oEvent.getSource().getValue().indexOf(',') != -1) {*/
					oEvent.getSource().setValue("");
					var dialogComma = new sap.m.Dialog({
						title: 'Error',
						type: 'Message',
						state: 'Error',
						content: new sap.m.Text({
							text: 'Special Charaters are not allowed'
						}),
						beginButton: new sap.m.Button({
							text: 'OK',
							press: function () {
								dialogComma.close();
							}
						}),
						afterClose: function () {
							dialogComma.destroy();
						}
					});
					dialogComma.open();
				} else if (parseInt(oEvent.getSource().getValue()) < 0) {
					oEvent.getSource().setValue("");
					var dialogNeg = new sap.m.Dialog({
						title: 'Error',
						type: 'Message',
						state: 'Error',
						content: new sap.m.Text({
							text: 'Negative marking is not allowed.'
						}),
						beginButton: new sap.m.Button({
							text: 'OK',
							press: function () {
								dialogNeg.close();
							}
						}),
						afterClose: function () {
							dialogNeg.destroy();
						}
					});
					dialogNeg.open();

				} else {

					if (!Number.isInteger(Number(oEvent.getSource().getValue()))) {
						var grd = sap.ui.getCore().getModel("Grade").getData().Value;
						var grades = "";
						if (grd) {
							for (var j = 0; j < grd.length; j++) {
								grades = grades + grd[j].AllwoedGrade + " ";
								if (oEvent.getSource().getValue() === grd[j].AllwoedGrade) {
									grdFlag = true;
									break;
								} else {
									grdFlag = false;
								}

							}
							if (!grdFlag) {
								oEvent.getSource().setValue("");
								var dialogGrd = new sap.m.Dialog({
									title: 'Error',
									type: 'Message',
									state: 'Error',
									content: new sap.m.Text({
										text: 'Please Enter The Allowed Grades:' + grades
									}),
									beginButton: new sap.m.Button({
										text: 'OK',
										press: function () {
											dialogGrd.close();
										}
									}),
									afterClose: function () {
										dialogGrd.destroy();
									}
								});
								dialogGrd.open();
							}
						}
					}
				}

			}
		},

		// Download Table Data
		onDataExport: sap.m.Table.prototype.exportData || function (oEvent) {

			var columns = [];
			var column = [];
			var colHeaders = NHView.dataModel.getData().Value;
			for (var i = 0; i < colHeaders.length; i++) {
				if (colHeaders[i].VisibilityFlag) {
					column = [{
						name: colHeaders[i].FieldName,
						template: {
							content: {
								parts: [colHeaders[i].FieldId]
							}
						}
					}];
					columns.push(column);
				}
			}

			var oExport = new Export({
				exportType: new ExportTypeCSV({
					fileExtension: "xls",
					separatorChar: "\t",
					charset: "utf-8",
					mimeType: "application/vnd.ms-excel"
				}),
				models: NHView.dataItemModel,
				rows: {
					path: "/Value"
				},
				columns: columns
			});
			// download exported file
			oExport.saveFile().catch(function (oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},
		onSubmit: function () {
			if (sap.ui.getCore().getModel("Grade").getData().Value) {
				var dateString = sap.ui.getCore().getModel("Grade").getData().Value[0].DEADLINE;
				var year = dateString.substring(0, 4);
				var month = dateString.substring(4, 6);
				var day = dateString.substring(6, 8);
				var deadLineDate = new Date(year, month - 1, day);
				var today = new Date();
				var AsmtDate = new Date(today.getFullYear(), today.getMonth(), today.getDay());
				if (AsmtDate >= deadLineDate) {
					var dialog_Error = new sap.m.Dialog({
						title: 'Response Error',
						type: 'Message',
						state: 'Error',
						content: new sap.m.Text({
							text: 'You Have  Cross The Deadline To Submit.'
						}),
						beginButton: new sap.m.Button({
							text: 'OK',
							press: function () {
								dialog_Error.close();
							}
						}),
						afterClose: function () {
							dialog_Error.destroy();
						}
					});
					dialog_Error.open();
				} else {

					var obj = NHView.dataItemModel.getData().Value;
					var objS = {};
					objS.His_items = [];
					//	var temp = [];
					for (var i = 0; i < obj.length; i++) {
						var temp = {
							COLUMN1: obj[i].COLUMN1,
							COLUMN2: obj[i].COLUMN2,
							COLUMN3: obj[i].COLUMN3,
							COLUMN4: obj[i].COLUMN4,
							COLUMN5: obj[i].COLUMN5,
							COLUMN6: obj[i].COLUMN6,
							COLUMN7: obj[i].COLUMN7,
							COLUMN8: obj[i].COLUMN8,
							COLUMN9: obj[i].COLUMN9,
							COLUMN10: obj[i].COLUMN10,
							COLUMN11: obj[i].COLUMN11,
							COLUMN12: obj[i].COLUMN12,
							COLUMN13: obj[i].COLUMN13,
							COLUMN14: obj[i].COLUMN14,
							COLUMN15: obj[i].COLUMN15,
							COLUMN16: obj[i].COLUMN16,
							COLUMN17: obj[i].COLUMN17,
							COLUMN18: obj[i].COLUMN18,
							COLUMN19: obj[i].COLUMN19,
							COLUMN20: obj[i].COLUMN20,
							COLUMN21: obj[i].COLUMN21,
							COLUMN22: obj[i].COLUMN22,
							COLUMN23: obj[i].COLUMN23,
							COLUMN24: obj[i].COLUMN24,
							COLUMN25: obj[i].COLUMN25,
							COLUMN26: obj[i].COLUMN26,
							COLUMN27: obj[i].COLUMN27,
							COLUMN28: obj[i].COLUMN28,
							COLUMN29: obj[i].COLUMN29,
							COLUMN30: obj[i].COLUMN30,
							SubjectID: obj[i].SubjectID,
							Term: obj[i].Term,
							Year: obj[i].Year
						};
						objS.His_items.push(temp);
					}
					objS.Year = NHView.oArgs.year;
					objS.SubjectID = NHView.oArgs.subject;
					objS.Term = NHView.oArgs.term;

					/*var itemData = [];

					itemData.His_items = NHView.dataItemModel.getData().Value;
					itemData.Year = NHView.oArgs.year;
					itemData.SubjectID = NHView.oArgs.subject;
					itemData.Term = NHView.oArgs.term;*/

					NHView.oModelSubmit = new sap.ui.model.odata.v2.ODataModel(NHView.sUrl, {
						json: true,
						loadMetadataAsync: true
					});

					NHView.oModelSubmit.create("/TableMetadataSet", objS, {
						success: function (oData) {
							var a;
						},
						error: function (oError) {

							var dialog_5 = new sap.m.Dialog({
								title: 'Response Error',
								type: 'Message',
								state: 'Error',
								content: new sap.m.Text({
									text: 'Server Connection Error'
								}),
								beginButton: new sap.m.Button({
									text: 'OK',
									press: function () {
										dialog_5.close();
									}
								}),
								afterClose: function () {
									dialog_5.destroy();
								}
							});
							dialog_5.open();
						}
					});

				}
			}
		},
		onBack: function () {
			NHView.byId("historicalTable").unbindRows();
			window.history.go(-1);
		}
	});

});