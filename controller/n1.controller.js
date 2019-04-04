var NView = null;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
], function(Controller, JSONModel, Filter) {
	"use strict";

	return Controller.extend("zmypgrading.controller.n1", {

		onInit: function() {
			this._initialize();
		},
		handleValueHelp: function(oEvent) {
			//	var sInputValue = oEvent.getSource().getValue();
			var sInputValue = "";
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"zmypgrading.util.Dialog",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			// create a filter for the binding
			this._valueHelpDialog.getBinding("items").filter([new Filter(
				"MapUname",
				sap.ui.model.FilterOperator.Contains, sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},

		_handleValueHelpSearch: function(evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"MapUname",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose: function(evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var userInput = this.byId(this.inputId),
					sDescription = oSelectedItem.getTitle();
				userInput.setSelectedKey(sDescription);
				NView.uName = sDescription;
				NView.handelYear();
			}
			evt.getSource().getBinding("items").filter([]);
		},

		suggestionItemSelected: function(evt) {

			var oItem = evt.getParameter('selectedItem'),
				oText = this.byId('selectedKey'),
				sKey = oItem ? oItem.getKey() : '';

			oText.setText(sKey);
		},
		_initialize: function() {
			var that = this;
			NView = this;
			this.sUrl = "/sap/opu/odata/sap/ZGW_SWA_GRADE_SRV/";
			var a = [];
			a.push(new sap.ui.model.Filter("AppType", sap.ui.model.FilterOperator.EQ, 'M'));
			var appType = new sap.ui.model.Filter({
				filters: a,
				and: true
			});
			var filter = new sap.ui.model.Filter({
				filters: [appType],
				and: true
			});

			var oDataModel = new sap.ui.model.odata.v2.ODataModel(that.sUrl, {
				json: true,
				loadMetadataAsync: true
			});
			oDataModel.read("/UserListSet", {
				filters: [filter],
				success: function(oData, response) {
					if (oData.results.length === 0) {
						that.byId("userListBox").setVisible(false);
						that.uName = "";
					} else {
						that.byId("userListBox").setVisible(true);
						var dataModelU = new JSONModel();
						dataModelU.setData({
							"Value": oData.results
						});
						that.getView().setModel(dataModelU, "userList");
						for (var i = 0; i < oData.results.length; i++) {
							if (oData.results[i].Flag === "X") {
								that.byId("UserListInp").setSelectedKey(oData.results[i].MapUname);
								that.uName = oData.results[i].MapUname;
							}
						}
					}
					that.handelYear();
					/*var oDataModel = new sap.ui.model.odata.v2.ODataModel(that.sUrl, {
						json: true,
						loadMetadataAsync: true
					});
					oDataModel.read("/YearSet", {
						success: function (oData, response) {

							var oDataModelY = new sap.ui.model.odata.v2.ODataModel(that.sUrl, {
								json: true,
								loadMetadataAsync: true
							});
							oDataModelY.read("/YearSet", {
								success: function (oData, response) {
									var dataModelY = new JSONModel();
									dataModelY.setData({
										"Value": oData.results
									});
									for (var y = 0; y < oData.results.length; y++) {
										if (oData.results[y].Flag === "X") {
											that.byId("idoSelect1").setSelectedKey(oData.results[y].yearId);
										}
									}
									that.getView().setModel(dataModelY, "Year");
									that.handleSelectionChange1();
								}
							});

						}
					});*/

				}
			});

		},
		handelYear: function(oEvent) {
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(NView.sUrl, {
				json: true,
				loadMetadataAsync: true
			});
			oDataModel.read("/YearSet", {
				success: function(oData, response) {
					var dataModelY = new JSONModel();
					dataModelY.setData({
						"Value": oData.results
					});
					for (var y = 0; y < oData.results.length; y++) {
						if (oData.results[y].Flag === "X") {
							NView.byId("idoSelect1").setSelectedKey(oData.results[y].yearId);
						}
					}
					NView.getView().setModel(dataModelY, "Year");
					NView.handleSelectionChange1();
				}
			});
		},
		handleLiveChange: function(oEvent) {
			var oTextArea = oEvent.getSource(),
				iValueLength = oTextArea.getValue().length,
				iMaxLength = oTextArea.getMaxLength(),
				sState = iValueLength > iMaxLength ? "Warning" : "None";
			oTextArea.setValueState(sState);
		},
		onHistorical: function(oEvent) {
			var year = this.byId("idoSelect1").getSelectedKey();
			var term = this.byId("idoSelect2").getSelectedKey();
			var termname = this.byId("idoSelect2")._getSelectedItemText();
			var subject = this.byId("idoSelect3").getSelectedKey();
			var name = this.byId("idoSelect3")._getSelectedItemText();
			var grd = this.byId("idoSelectGrd")._getSelectedItemText();
			var uName = "";
			if (NView.uName === "") {
				uName = "X";
			} else {
				uName = NView.uName;
			}
			if (year !== "" && term !== "" && subject !== "" && name !== "") {
				this.getOwnerComponent().getRouter().navTo("historical", {
					year: year,
					term: term,
					subject: subject,
					name: name,
					tname: termname,
					grd: grd,
					uname: uName
				});
			} else {
				var dialog_Msg = new sap.m.Dialog({
					title: 'Error',
					type: 'Message',
					state: 'Error',
					content: new sap.m.Text({
						text: 'Please select TERM YEAR and SUBJECT'
					}),
					beginButton: new sap.m.Button({
						text: 'OK',
						press: function() {
							dialog_Msg.close();
						}
					}),
					afterClose: function() {
						dialog_Msg.destroy();
					}
				});
				dialog_Msg.open();
			}
		},
		handleSelectionChange1: function() {
			var that = this;
			this.sUrl = "/sap/opu/odata/sap/ZGW_SWA_GRADE_SRV/";
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(that.sUrl, {
				json: true,
				loadMetadataAsync: true
			});
			oDataModel.read("/TermSet", {
				success: function(oData, response) {
					var dataModel = new JSONModel();
					dataModel.setData({
						"Value": oData.results
					});
					for (var f = 0; f < oData.results.length; f++) {
						if (oData.results[f].Flag === "X") {
							that.byId("idoSelect2").setSelectedKey(oData.results[f].termId);
						}
					}
					that.getView().setModel(dataModel, "Term");
					that.handleSelectionChange2();
				},
				error: function(oError) {
					that.byId("idoSelect2").destroyItems();
					that.byId("idoSelect3").destroyItems();
					that.byId("idoSelect4").destroyItems();
					that.byId("idoSelect5").destroyItems();
				}
			});
		},
		handleSelectionChange2: function() {
			var that = this;
			this.sUrl = "/sap/opu/odata/sap/ZGW_SWA_GRADE_SRV/";
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(that.sUrl, {
				json: true,
				loadMetadataAsync: true
			});
			if (that.byId("idoSelect1").getSelectedKey() === "") {
				if (that.byId("idoSelect1").getFirstItem()) {
					that.year = that.byId("idoSelect1").getFirstItem().getKey();
					that.byId("idoSelect1").setSelectedKey(that.year);
				}
			} else {
				that.year = that.byId("idoSelect1").getSelectedKey();
			}
			if (that.byId("idoSelect2").getSelectedKey() === "") {
				if (that.byId("idoSelect2").getFirstItem()) {
					that.term = that.byId("idoSelect2").getFirstItem().getKey();
					that.byId("idoSelect2").setSelectedKey(that.term);
				}
			} else {
				that.term = that.byId("idoSelect2").getSelectedKey();
			}
			var a = [],
				b = [],
				c = [],
				d = [];
			a.push(new sap.ui.model.Filter("Year", sap.ui.model.FilterOperator.EQ, that.year));
			b.push(new sap.ui.model.Filter("Term", sap.ui.model.FilterOperator.EQ, that.term));
			c.push(new sap.ui.model.Filter("MYP", sap.ui.model.FilterOperator.EQ, "T"));
			d.push(new sap.ui.model.Filter("responseText", sap.ui.model.FilterOperator.EQ, that.uName));
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
			var filterName = new sap.ui.model.Filter({
				filters: d,
				and: true
			});
			var filter = new sap.ui.model.Filter({
				filters: [filter1, filter2, filter3, filterName],
				and: true
			});
			oDataModel.read("/timetableSet", {
				filters: [filter],
				success: function(oData, response) {
					var dataModel = new JSONModel();
					dataModel.setData({
						"Value": oData.results
					});
					that.getView().setModel(dataModel, "GRD");
					if (oData.results.length === 0) {
						that.byId("idoSelectGrd").destroyItems();
						that.byId("idoSelect3").destroyItems();
						that.byId("idoSelect4").destroyItems();
						that.byId("idoSelect5").destroyItems();
					} else {
						that.byId("idoSelectGrd").setSelectedKey(oData.results[0].GRADE_ID);
					}
					that.handleSelectionChangeSub();
				},
				error: function(oError) {
					that.byId("idoSelectGrd").destroyItems();
					that.byId("idoSelect3").destroyItems();
					that.byId("idoSelect4").destroyItems();
					that.byId("idoSelect5").destroyItems();
				}
			});
		},
		handleSelectionChangeGrd: function() {
			var that = this;
			this.sUrl = "/sap/opu/odata/sap/ZGW_SWA_GRADE_SRV/";
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(that.sUrl, {
				json: true,
				loadMetadataAsync: true
			});
			if (that.byId("idoSelect1").getSelectedKey() === "") {
				if (that.byId("idoSelect1").getFirstItem()) {
					that.year = that.byId("idoSelect1").getFirstItem().getKey();
					that.byId("idoSelect1").setSelectedKey(that.year);
				}
			} else {
				that.year = that.byId("idoSelect1").getSelectedKey();
			}
			if (that.byId("idoSelect2").getSelectedKey() === "") {
				if (that.byId("idoSelect2").getFirstItem()) {
					that.term = that.byId("idoSelect2").getFirstItem().getKey();
					that.byId("idoSelect2").setSelectedKey(that.term);
				}
			} else {
				that.term = that.byId("idoSelect2").getSelectedKey();
			}
			var a = [],
				b = [],
				c = [],
				d = [],
				e = [];
			var grd = that.getView().byId("idoSelectGrd").getSelectedKey();
			a.push(new sap.ui.model.Filter("Year", sap.ui.model.FilterOperator.EQ, that.year));
			b.push(new sap.ui.model.Filter("Term", sap.ui.model.FilterOperator.EQ, that.term));
			c.push(new sap.ui.model.Filter("MYP", sap.ui.model.FilterOperator.EQ, "T"));
			d.push(new sap.ui.model.Filter("GRADE_ID", sap.ui.model.FilterOperator.EQ, grd));
			e.push(new sap.ui.model.Filter("responseText", sap.ui.model.FilterOperator.EQ, that.uName));
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
			var filterName = new sap.ui.model.Filter({
				filters: e,
				and: true
			});
			var filter = new sap.ui.model.Filter({
				filters: [filter1, filter2, filter3, filter4, filterName],
				and: true
			});
			oDataModel.read("/timetableSet", {
				filters: [filter],
				success: function(oData, response) {
					var dataModel = new JSONModel();
					dataModel.setData({
						"Value": oData.results
					});
					that.getView().setModel(dataModel, "Subject");
					if (oData.results.length > 0) {
						that.byId("idoSelect3").setSelectedKey(oData.results[0].ObjectId);
					}
					that.handleSelectionChange3();
				},
				error: function(oError) {
					that.byId("idoSelect2").destroyItems();
					that.byId("idoSelect5").destroyItems();
					that.byId("idoSelect6").destroyItems();
				}
			});
		},
		handleSelectionChangeSub: function() {
			var that = this;
			this.sUrl = "/sap/opu/odata/sap/ZGW_SWA_GRADE_SRV/";
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(that.sUrl, {
				json: true,
				loadMetadataAsync: true
			});
			if (that.byId("idoSelect1").getSelectedKey() === "") {
				if (that.byId("idoSelect1").getFirstItem()) {
					that.year = that.byId("idoSelect1").getFirstItem().getKey();
					that.byId("idoSelect1").setSelectedKey(that.year);
				}
			} else {
				that.year = that.byId("idoSelect1").getSelectedKey();
			}
			if (that.byId("idoSelect2").getSelectedKey() === "") {
				if (that.byId("idoSelect2").getFirstItem()) {
					that.term = that.byId("idoSelect2").getFirstItem().getKey();
					that.byId("idoSelect2").setSelectedKey(that.term);
				}
			} else {
				that.term = that.byId("idoSelect2").getSelectedKey();
			}
			var a = [],
				b = [],
				c = [],
				d = [],
				e = [];
			if (that.getView().getModel("GRD").getData().Value.length > 0) {
				var grd = that.getView().getModel("GRD").getData().Value[0].GRADE_ID;
			}
			a.push(new sap.ui.model.Filter("Year", sap.ui.model.FilterOperator.EQ, that.year));
			b.push(new sap.ui.model.Filter("Term", sap.ui.model.FilterOperator.EQ, that.term));
			c.push(new sap.ui.model.Filter("MYP", sap.ui.model.FilterOperator.EQ, "T"));
			d.push(new sap.ui.model.Filter("GRADE_ID", sap.ui.model.FilterOperator.EQ, grd));
			e.push(new sap.ui.model.Filter("responseText", sap.ui.model.FilterOperator.EQ, that.uName));
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
			var filterName = new sap.ui.model.Filter({
				filters: e,
				and: true
			});

			var filter = new sap.ui.model.Filter({
				filters: [filter1, filter2, filter3, filter4, filterName],
				and: true
			});
			oDataModel.read("/timetableSet", {
				filters: [filter],
				success: function(oData, response) {
					var dataModel = new JSONModel();
					dataModel.setData({
						"Value": oData.results
					});
					that.getView().setModel(dataModel, "Subject");
					that.handleSelectionChange3();
				},
				error: function(oError) {
					that.byId("idoSelect2").destroyItems();
					that.byId("idoSelect5").destroyItems();
					that.byId("idoSelect6").destroyItems();
				}
			});
		},

		handleSelectionChange3: function() {
			var that = this;
			this.sUrl = "/sap/opu/odata/sap/ZGW_SWA_GRADE_SRV/";
			var dataModel = new JSONModel();
			if (that.term === '200' || that.term === "400") {
				var a = [{
					key: 1,
					value: "ST1"
				}, {
					key: 2,
					value: "ST2"
				}, {
					key: 3,
					value: "ST3"
				}, {
					key: 4,
					value: "Best Fit"
				}, {
					key: 5,
					value: "Attitude Grade"
				}, {
					key: 6,
					value: "ST_Exam"
				}, {
					key: 7,
					value: "Comment"
				}, {
					key: 8,
					value: "Attendance"
				}, {
					key: 9,
					value: "Punctuality"
				}, {
					key: 10,
					value: "Level"
				}];
				dataModel.setData({
					"Value": a
				});

			} else {
				var a = [{
					key: 1,
					value: "ST1"
				}, {
					key: 2,
					value: "ST2"
				}, {
					key: 3,
					value: "ST3"
				}, {
					key: 4,
					value: "Best Fit"
				}, {
					key: 5,
					value: "Attitude Grade"
				}, {
					key: 7,
					value: "Comment"
				}, {
					key: 8,
					value: "Attendace"
				}, {
					key: 9,
					value: "Punctuality"
				}, {
					key: 10,
					value: "Level"
				}];
				dataModel.setData({
					"Value": a
				});
			}
			that.getView().setModel(dataModel, "task");
			that.handleSelectionChange4();
		},
		handleSelectionChange4: function(event) {
			var that = this;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(that.sUrl, {
				json: true,
				loadMetadataAsync: true
			});
			var dataModel = new JSONModel();
			if (that.byId("idoSelect3").getSelectedKey() === "") {
				if (that.byId("idoSelect3").getFirstItem()) {
					that.objectId = that.byId("idoSelect3").getFirstItem().getKey();
					that.byId("idoSelect3").setSelectedKey(that.objectId);
				}
			} else {
				if (that.byId("idoSelect3").getSelectedItem() === null) {
					that.objectId = "";
				} else {
					that.objectId = that.byId("idoSelect3").getSelectedKey();
				}
			}
			if (that.byId("idoSelect4").getSelectedKey() === "") {
				that.tasktype = that.byId("idoSelect4").getFirstItem().getKey();
				that.byId("idoSelect4").setSelectedKey(that.objectId);
			} else {
				that.tasktype = that.byId("idoSelect4").getSelectedKey();
			}
			var a = [],
				b = [],
				c = [],
				d = [],
				e = [],
				f = [];
			a.push(new sap.ui.model.Filter("Year", sap.ui.model.FilterOperator.EQ, that.year));
			b.push(new sap.ui.model.Filter("Term", sap.ui.model.FilterOperator.EQ, that.term));
			c.push(new sap.ui.model.Filter("SubjectID", sap.ui.model.FilterOperator.EQ, that.objectId));
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

			if (that.tasktype === "1") {
				that.byId("__label7").setText("Assignment Date");
				this.byId("maxScore").setValue("8");
				that.byId("idoSelect5").setVisible(false);
				that.byId("blankL").setVisible(false);
				that.byId("btnsubmit").setVisible(false);
				that.byId("blank").setVisible(false);
				that.byId("maxMinL").setVisible(false);
				that.byId("maxMin").setVisible(false);
				that.byId("avgL").setVisible(false);
				that.byId("avg").setVisible(false);
				that.byId("input5").setVisible(true);
				that.byId("input5").setValue("ST1");
				that.byId("AssName").setVisible(true);
				that.byId("__vbox6").setVisible(true);
				that.byId("idTable2").setVisible(false);
				that.byId("idTable3").setVisible(false);
				that.byId("idTable1").setVisible(true);
				d.push(new sap.ui.model.Filter("SUMMATIVE_TASK", sap.ui.model.FilterOperator.EQ, "X"));
				e.push(new sap.ui.model.Filter("filter", sap.ui.model.FilterOperator.EQ, "ST1"));
				f.push(new sap.ui.model.Filter("LastName", sap.ui.model.FilterOperator.EQ, that.uName));
				var filter5 = new sap.ui.model.Filter({
					filters: e,
					and: true
				});
				var filter4 = new sap.ui.model.Filter({
					filters: d,
					and: true
				});

				var filterName = new sap.ui.model.Filter({
					filters: f,
					and: true
				});

				var filter = new sap.ui.model.Filter({
					filters: [filter1, filter2, filter3, filter4, filter5, filterName],
					and: true
				});
				oDataModel.read("/StudentDetailsMYPSet", {
					filters: [filter],
					success: function(oData, response) {
						var dataModel = new JSONModel();
						dataModel.setData({
							"Value": oData.results
						});
						that.getView().setModel(dataModel, "StudentDetails");
						that.updateScore();
					},
					error: function(oError) {
						that.byId("idoSelect5").destroyItems();
						that.byId("idoSelect6").destroyItems();
					}
				});
			} else if (that.tasktype === "2") {
				this.byId("maxScore").setValue("8");
				that.byId("__label7").setText("Assignment Date");
				that.byId("__vbox6").setVisible(true);
				that.byId("blankL").setVisible(false);
				that.byId("blank").setVisible(false);
				that.byId("maxMinL").setVisible(false);
				that.byId("maxMin").setVisible(false);
				that.byId("avgL").setVisible(false);
				that.byId("avg").setVisible(false);
				that.byId("input5").setVisible(true);
				that.byId("input5").setValue("ST2");
				that.byId("idoSelect5").setVisible(false);
				that.byId("idTable2").setVisible(false);
				that.byId("idTable3").setVisible(false);
				that.byId("AssName").setVisible(true);
				that.byId("idTable1").setVisible(true);
				that.byId("btnsubmit").setVisible(false);
				d.push(new sap.ui.model.Filter("SUMMATIVE_TASK", sap.ui.model.FilterOperator.EQ, "X"));
				e.push(new sap.ui.model.Filter("filter", sap.ui.model.FilterOperator.EQ, "ST2"));
				f.push(new sap.ui.model.Filter("LastName", sap.ui.model.FilterOperator.EQ, that.uName));
				var filter5 = new sap.ui.model.Filter({
					filters: e,
					and: true
				});
				var filter4 = new sap.ui.model.Filter({
					filters: d,
					and: true
				});
				var filterName = new sap.ui.model.Filter({
					filters: f,
					and: true
				});
				var filter = new sap.ui.model.Filter({
					filters: [filter1, filter2, filter3, filter4, filter5, filterName],
					and: true
				});
				oDataModel.read("/StudentDetailsMYPSet", {
					filters: [filter],
					success: function(oData, response) {
						var dataModel = new JSONModel();
						dataModel.setData({
							"Value": oData.results
						});
						that.getView().setModel(dataModel, "StudentDetails");
						that.updateScore();
					},
					error: function(oError) {
						that.byId("idoSelect5").destroyItems();
						that.byId("idoSelect6").destroyItems();
					}
				});
			} else
			if (that.tasktype === "3") {
				this.byId("maxScore").setValue("8");
				that.byId("__label7").setText("Assignment Date");
				that.byId("__vbox6").setVisible(true);
				that.byId("blankL").setVisible(false);
				that.byId("blank").setVisible(false);
				that.byId("idoSelect5").setVisible(false);
				that.byId("maxMinL").setVisible(false);
				that.byId("maxMin").setVisible(false);
				that.byId("avgL").setVisible(false);
				that.byId("avg").setVisible(false);
				that.byId("input5").setVisible(true);
				that.byId("input5").setValue("ST3");
				that.byId("AssName").setVisible(true);
				that.byId("idTable2").setVisible(false);
				that.byId("idTable3").setVisible(false);
				that.byId("idTable1").setVisible(true);
				that.byId("btnsubmit").setVisible(false);
				d.push(new sap.ui.model.Filter("SUMMATIVE_TASK", sap.ui.model.FilterOperator.EQ, "X"));
				e.push(new sap.ui.model.Filter("filter", sap.ui.model.FilterOperator.EQ, "ST3"));
				f.push(new sap.ui.model.Filter("LastName", sap.ui.model.FilterOperator.EQ, that.uName));
				var filter5 = new sap.ui.model.Filter({
					filters: e,
					and: true
				});
				var filter4 = new sap.ui.model.Filter({
					filters: d,
					and: true
				});
				var filterName = new sap.ui.model.Filter({
					filters: f,
					and: true
				});
				var filter = new sap.ui.model.Filter({
					filters: [filter1, filter2, filter3, filter4, filter5, filterName],
					and: true
				});
				oDataModel.read("/StudentDetailsMYPSet", {
					filters: [filter],
					success: function(oData, response) {

						var dataModel = new JSONModel();
						dataModel.setData({
							"Value": oData.results
						});
						that.getView().setModel(dataModel, "StudentDetails");
						that.updateScore();
					},
					error: function(oError) {

						that.byId("idoSelect5").destroyItems();
						that.byId("idoSelect6").destroyItems();
					}
				});
			} else
			if (that.tasktype === "4") {
				this.byId("maxScore").setValue("8");
				that.byId("__label7").setText("Submission Date");
				that.byId("__vbox6").setVisible(true);
				that.byId("maxMinL").setVisible(true);
				that.byId("maxMin").setVisible(true);
				that.byId("avgL").setVisible(true);
				that.byId("avg").setVisible(true);
				that.byId("idoSelect5").setVisible(true);
				that.byId("AssName").setVisible(false);
				that.byId("input5").setVisible(false);
				that.byId("idTable1").setVisible(false);
				that.byId("idTable3").setVisible(false);
				that.byId("idTable2").setVisible(true);
				that.byId("btnsubmit").setVisible(true);
				that.handleSelectionChange4_1();
			} else if (that.tasktype === "5") {
				this.byId("maxScore").setValue("8");
				that.byId("colLevel").setVisible(false);
				that.byId("__label7").setText("Submission Date");
				that.byId("__vbox6").setVisible(true);
				that.byId("maxMinL").setVisible(false);
				that.byId("maxMin").setVisible(false);
				that.byId("avgL").setVisible(false);
				that.byId("avg").setVisible(false);
				that.byId("idoSelect5").setVisible(false);
				that.byId("idTable2").setVisible(false);
				that.byId("input5").setVisible(true);
				that.byId("input5").setValue("Attitude Grade");
				that.byId("idTable1").setVisible(false);
				that.byId("AssName").setVisible(false);
				that.byId("idTable3").setVisible(true);
				that.byId("colScore").setVisible(true);
				that.byId("finalPer").setVisible(false);
				that.byId("finalGrd").setVisible(false);
				that.byId("ln").setWidth("30%");
				that.byId("fn").setWidth("30%");
				that.byId("btnsubmit").setVisible(false);
				that.byId("notestab3").setText("Notes");
				e.push(new sap.ui.model.Filter("filter", sap.ui.model.FilterOperator.EQ, "AG"));
				d.push(new sap.ui.model.Filter("ATTITUDE_GRADE", sap.ui.model.FilterOperator.EQ, "X"));
				f.push(new sap.ui.model.Filter("LastName", sap.ui.model.FilterOperator.EQ, that.uName));
				var filter4 = new sap.ui.model.Filter({
					filters: d,
					and: true
				});
				var filter5 = new sap.ui.model.Filter({
					filters: e,
					and: true
				});
				var filterName = new sap.ui.model.Filter({
					filters: f,
					and: true
				});
				var filter = new sap.ui.model.Filter({
					filters: [filter1, filter2, filter3, filter4, filter5, filterName],
					and: true
				});
				oDataModel.read("/StudentDetailsMYPSet", {
					filters: [filter],
					success: function(oData, response) {
						var a = [{
							key: "",
							text: ""
						}, {
							key: "E",
							text: "Excellent"
						}, {
							key: "G",
							text: "Good"
						}, {
							key: "S",
							text: "Satisfactory"
						}, {
							key: "M",
							text: "Mediocre"
						}, {
							key: "U",
							text: "Unacceptable"
						}];
						for (var i = 0; i < oData.results.length; i++) {
							if (oData.results[i].SCORE === "") {
								oData.results[i].SCORE = "";
							}
						}
						var dataModel = new JSONModel();
						dataModel.setData({
							"Value": oData.results
						});
						var dataModel2 = new JSONModel();
						dataModel2.setData({
							"Value": a
						});
						that.getView().setModel(dataModel, "StudentDetails");
						that.getView().setModel(dataModel2, "Grade");
						that.updateScore();
					},
					error: function(oError) {
						that.byId("idoSelect5").destroyItems();
						that.byId("idoSelect6").destroyItems();
					}
				});
			} else
			if (that.tasktype === "6") {
				this.byId("maxScore").setValue("8");
				that.byId("__label7").setText("Assignment Date");
				that.byId("__vbox6").setVisible(true);
				that.byId("blankL").setVisible(false);
				that.byId("blank").setVisible(false);
				that.byId("idoSelect5").setVisible(false);
				that.byId("maxMinL").setVisible(false);
				that.byId("AssName").setVisible(true);
				that.byId("maxMin").setVisible(false);
				that.byId("avgL").setVisible(false);
				that.byId("avg").setVisible(false);
				that.byId("input5").setVisible(true);
				that.byId("input5").setValue("ST_EXAM");
				that.byId("idTable2").setVisible(false);

				that.byId("idTable3").setVisible(false);
				that.byId("btnsubmit").setVisible(false);
				that.byId("idTable1").setVisible(true);
				d.push(new sap.ui.model.Filter("SUMMATIVE_TASK", sap.ui.model.FilterOperator.EQ, "X"));
				e.push(new sap.ui.model.Filter("filter", sap.ui.model.FilterOperator.EQ, "EX"));
				f.push(new sap.ui.model.Filter("LastName", sap.ui.model.FilterOperator.EQ, that.uName));
				var filter5 = new sap.ui.model.Filter({
					filters: e,
					and: true
				});
				var filter4 = new sap.ui.model.Filter({
					filters: d,
					and: true
				});
				var filterName = new sap.ui.model.Filter({
					filters: f,
					and: true
				});
				var filter = new sap.ui.model.Filter({
					filters: [filter1, filter2, filter3, filter4, filter5, filterName],
					and: true
				});
				oDataModel.read("/StudentDetailsMYPSet", {
					filters: [filter],
					success: function(oData, response) {
						var dataModel = new JSONModel();
						dataModel.setData({
							"Value": oData.results
						});
						that.getView().setModel(dataModel, "StudentDetails");
						that.updateScore();
					},
					error: function(oError) {
						that.byId("idoSelect5").destroyItems();
						that.byId("idoSelect6").destroyItems();
					}
				});

			} else if (that.tasktype === "7") {
				this.byId("maxScore").setValue("8");
				that.byId("maxMinL").setVisible(false);
				that.byId("__vbox6").setVisible(false);
				that.byId("maxMin").setVisible(false);
				that.byId("avgL").setVisible(false);
				that.byId("avg").setVisible(false);
				that.byId("idoSelect5").setVisible(false);
				that.byId("idTable2").setVisible(false);
				that.byId("input5").setVisible(true);
				that.byId("input5").setValue("Attitude Grade");
				that.byId("colNotes").setVisible(true);
				that.byId("colLevel").setVisible(false);
				that.byId("idTable1").setVisible(false);
				that.byId("btnsubmit").setVisible(false);
				that.byId("idTable3").setVisible(true);
				that.byId("colScore").setVisible(false);
				that.byId("AssName").setVisible(false);
				that.byId("finalPer").setVisible(false);
				that.byId("finalGrd").setVisible(false);
				that.byId("__label7").setText("Submission Date");
				that.byId("ln").setWidth("40%");
				that.byId("fn").setWidth("40%");
				that.byId("notestab3").setText("Comments");
				e.push(new sap.ui.model.Filter("filter", sap.ui.model.FilterOperator.EQ, "COMM"));
				d.push(new sap.ui.model.Filter("COMMENTS", sap.ui.model.FilterOperator.EQ, "X"));
				f.push(new sap.ui.model.Filter("LastName", sap.ui.model.FilterOperator.EQ, that.uName));
				var filter4 = new sap.ui.model.Filter({
					filters: d,
					and: true
				});
				var filter5 = new sap.ui.model.Filter({
					filters: e,
					and: true
				});
				var filterName = new sap.ui.model.Filter({
					filters: f,
					and: true
				});
				var filter = new sap.ui.model.Filter({
					filters: [filter1, filter2, filter3, filter4, filter5, filterName],
					and: true
				});
				oDataModel.read("/StudentDetailsMYPSet", {
					filters: [filter],
					success: function(oData, response) {

						var dataModel = new JSONModel();
						dataModel.setData({
							"Value": oData.results
						});
						that.getView().setModel(dataModel, "StudentDetails");
						that.getView().byId("input5").setValue("Comments");
						that.updateScore();
					},
					error: function(oError) {
						that.byId("idoSelect5").destroyItems();
					}
				});
			} else if (that.tasktype === "8") {
				that.byId("__label7").setText("Submission Date");
				that.byId("__vbox6").setVisible(true);
				that.byId("maxMinL").setVisible(false);
				that.byId("maxMin").setVisible(false);
				that.byId("avgL").setVisible(false);
				that.byId("avg").setVisible(false);
				that.byId("idoSelect5").setVisible(false);
				that.byId("idTable2").setVisible(false);
				that.byId("input5").setVisible(true);
				that.byId("input5").setValue("Attendance");
				that.byId("idTable1").setVisible(false);
				that.byId("AssName").setVisible(false);
				that.byId("idTable3").setVisible(true);
				that.byId("colScore").setVisible(true);
				that.byId("finalPer").setVisible(false);
				that.byId("finalGrd").setVisible(false);
				that.byId("colNotes").setVisible(false);
				that.byId("ln").setWidth("30%");
				that.byId("fn").setWidth("30%");
				that.byId("btnsubmit").setVisible(false);
				that.byId("notestab3").setText("Notes");
				that.byId("colLevel").setVisible(false);
				e.push(new sap.ui.model.Filter("filter", sap.ui.model.FilterOperator.EQ, "AT"));
				d.push(new sap.ui.model.Filter("ATTENDANCE", sap.ui.model.FilterOperator.EQ, "X"));
				f.push(new sap.ui.model.Filter("LastName", sap.ui.model.FilterOperator.EQ, that.uName));
				var filter4 = new sap.ui.model.Filter({
					filters: d,
					and: true
				});
				var filter5 = new sap.ui.model.Filter({
					filters: e,
					and: true
				});
				var filterName = new sap.ui.model.Filter({
					filters: f,
					and: true
				});
				var filter = new sap.ui.model.Filter({
					filters: [filter1, filter2, filter3, filter4, filter5, filterName],
					and: true
				});
				oDataModel.read("/StudentDetailsMYPSet", {
					filters: [filter],
					success: function(oData, response) {
						var a = [{
							key: "",
							text: ""
						}, {
							key: "E",
							text: "Excellent"
						},  {
							key: "S",
							text: "Satisfactory"
						}, {
							key: "C",
							text: "Concern"
						}, {
							key: "U",
							text: "Unacceptable"
						}];
						for (var i = 0; i < oData.results.length; i++) {
							if (oData.results[i].SCORE === "") {
								oData.results[i].SCORE = "";
							}
						}
						var dataModel = new JSONModel();
						dataModel.setData({
							"Value": oData.results
						});
						var dataModel2 = new JSONModel();
						dataModel2.setData({
							"Value": a
						});
						that.getView().setModel(dataModel, "StudentDetails");
						that.getView().setModel(dataModel2, "Grade");
						that.updateScore();
					},
					error: function(oError) {
						that.byId("idoSelect5").destroyItems();
						that.byId("idoSelect6").destroyItems();
					}
				});
			} else if (that.tasktype === "9") {
				that.byId("__label7").setText("Submission Date");
				that.byId("__vbox6").setVisible(true);
				that.byId("maxMinL").setVisible(false);
				that.byId("maxMin").setVisible(false);
				that.byId("avgL").setVisible(false);
				that.byId("avg").setVisible(false);
				that.byId("idoSelect5").setVisible(false);
				that.byId("idTable2").setVisible(false);
				that.byId("input5").setVisible(true);
				that.byId("input5").setValue("Punctuality");
				that.byId("idTable1").setVisible(false);
				that.byId("AssName").setVisible(false);
				that.byId("idTable3").setVisible(true);
				that.byId("colScore").setVisible(true);
				that.byId("finalPer").setVisible(false);
				that.byId("finalGrd").setVisible(false);
				that.byId("colNotes").setVisible(false);
				that.byId("ln").setWidth("30%");
				that.byId("fn").setWidth("30%");
				that.byId("btnsubmit").setVisible(false);
				that.byId("notestab3").setText("Notes");
				that.byId("colLevel").setVisible(false);
				e.push(new sap.ui.model.Filter("filter", sap.ui.model.FilterOperator.EQ, "PU"));
				d.push(new sap.ui.model.Filter("PUNCTUALITY", sap.ui.model.FilterOperator.EQ, "X"));
				f.push(new sap.ui.model.Filter("LastName", sap.ui.model.FilterOperator.EQ, that.uName));
				var filter4 = new sap.ui.model.Filter({
					filters: d,
					and: true
				});
				var filter5 = new sap.ui.model.Filter({
					filters: e,
					and: true
				});
				var filterName = new sap.ui.model.Filter({
					filters: f,
					and: true
				});
				var filter = new sap.ui.model.Filter({
					filters: [filter1, filter2, filter3, filter4, filter5, filterName],
					and: true
				});
				oDataModel.read("/StudentDetailsMYPSet", {
					filters: [filter],
					success: function(oData, response) {
						var a = [{
							key: "",
							text: ""
						}, {
							key: "E",
							text: "Excellent"
						},  {
							key: "S",
							text: "Satisfactory"
						}, {
							key: "C",
							text: "Concern"
						}, {
							key: "U",
							text: "Unacceptable"
						}];
						for (var i = 0; i < oData.results.length; i++) {
							if (oData.results[i].SCORE === "") {
								oData.results[i].SCORE = "";
							}
						}
						var dataModel = new JSONModel();
						dataModel.setData({
							"Value": oData.results
						});
						var dataModel2 = new JSONModel();
						dataModel2.setData({
							"Value": a
						});
						that.getView().setModel(dataModel, "StudentDetails");
						that.getView().setModel(dataModel2, "Grade");
						that.updateScore();
					},
					error: function(oError) {
						that.byId("idoSelect5").destroyItems();
						that.byId("idoSelect6").destroyItems();
					}
				});
			} else if (that.tasktype === "10") {
				that.byId("__label7").setText("Submission Date");
				this.byId("maxScore").setValue("6");
				that.byId("__vbox6").setVisible(true);
				that.byId("maxMinL").setVisible(false);
				that.byId("maxMin").setVisible(false);
				that.byId("avgL").setVisible(false);
				that.byId("avg").setVisible(false);
				that.byId("idoSelect5").setVisible(false);
				that.byId("idTable2").setVisible(false);
				that.byId("input5").setVisible(true);
				that.byId("input5").setValue("Level");
				that.byId("idTable1").setVisible(false);
				that.byId("AssName").setVisible(false);
				that.byId("idTable3").setVisible(true);
				that.byId("colScore").setVisible(false);
				that.byId("finalPer").setVisible(false);
				that.byId("finalGrd").setVisible(false);
				that.byId("colNotes").setVisible(false);
				that.byId("ln").setWidth("30%");
				that.byId("fn").setWidth("30%");
				that.byId("btnsubmit").setVisible(false);
				that.byId("notestab3").setText("Notes");
				that.byId("colLevel").setVisible(true);
				e.push(new sap.ui.model.Filter("filter", sap.ui.model.FilterOperator.EQ, "LE"));
				d.push(new sap.ui.model.Filter("LEVEL", sap.ui.model.FilterOperator.EQ, "X"));
				f.push(new sap.ui.model.Filter("LastName", sap.ui.model.FilterOperator.EQ, that.uName));
				var filter4 = new sap.ui.model.Filter({
					filters: d,
					and: true
				});
				var filter5 = new sap.ui.model.Filter({
					filters: e,
					and: true
				});
				var filterName = new sap.ui.model.Filter({
					filters: f,
					and: true
				});
				var filter = new sap.ui.model.Filter({
					filters: [filter1, filter2, filter3, filter4, filter5, filterName],
					and: true
				});
				oDataModel.read("/StudentDetailsMYPSet", {
					filters: [filter],
					success: function(oData, response) {
						var dataModel = new JSONModel();
						dataModel.setData({
							"Value": oData.results
						});
						that.getView().setModel(dataModel, "StudentDetails");
						that.updateScore();
					},
					error: function(oError) {
						that.byId("idoSelect5").destroyItems();
						that.byId("idoSelect6").destroyItems();
					}
				});

			}
		},
		handleSelectionChange4_1: function(event) {
			var that = this;
			var dataModel = new JSONModel();
			var a = [{
				key: 1,
				value: "A"
			}, {
				key: 2,
				value: "B"
			}, {
				key: 3,
				value: "C"
			}, {
				key: 4,
				value: "D"
			}];
			dataModel.setData({
				"Value": a
			});
			that.getView().setModel(dataModel, "SubTask");
			that.handleSelectionChange5();
		},
		handleSelectionChange5: function(event) {
			var that = this;
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(that.sUrl, {
				json: true,
				loadMetadataAsync: true
			});
			if (that.byId("idoSelect5").getSelectedItem() === null) {
				if (that.byId("idoSelect5").getFirstItem()) {
					var temp = that.byId("idoSelect5").getFirstItem().getKey();
					that.byId("idoSelect5").setSelectedKey(temp);
					that.AppraisalType = that.byId("idoSelect5").getSelectedItem().getText();
				}
			} else {
				that.AppraisalType = that.byId("idoSelect5").getSelectedItem().getText();
			}
			var a = [],
				b = [],
				c = [],
				d = [],
				e = [],
				f = [];
			e.push(new sap.ui.model.Filter("BEST_FIT", sap.ui.model.FilterOperator.EQ, "X"));
			var filter5 = new sap.ui.model.Filter({
				filters: e,
				and: true
			});
			a.push(new sap.ui.model.Filter("Year", sap.ui.model.FilterOperator.EQ, that.year));
			b.push(new sap.ui.model.Filter("Term", sap.ui.model.FilterOperator.EQ, that.term));
			c.push(new sap.ui.model.Filter("SubjectID", sap.ui.model.FilterOperator.EQ, that.objectId));
			d.push(new sap.ui.model.Filter("filter", sap.ui.model.FilterOperator.EQ, that.AppraisalType));
			f.push(new sap.ui.model.Filter("LastName", sap.ui.model.FilterOperator.EQ, that.uName));
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
			var filterName = new sap.ui.model.Filter({
				filters: f,
				and: true
			});
			var filter = new sap.ui.model.Filter({
				filters: [filter1, filter2, filter3, filter4, filter5, filterName],
				and: true
			});
			oDataModel.read("/StudentDetailsMYPSet", {
				filters: [filter],
				success: function(oData, response) {
					var dataModel = new JSONModel();
					dataModel.setData({
						"Value": oData.results
					});
					that.getView().setModel(dataModel, "StudentDetails");
					that.updateScore();
				},
				error: function(oError) {
					that.byId("idoSelect5").destroyItems();
				}
			});
		},
		onSubmit: function() {
			NView = this;
			var subKey = null,
				year = null,
				term = null;
			if (parseInt(NView.byId("DTI1").getValue()) !== 0 && NView.byId("DTI1").getValue() !== "") {
				if (this.byId("idoSelect3").getSelectedItem() !== null) {
					subKey = this.byId("idoSelect3").getSelectedKey();
				}
				if (this.byId("idoSelect1").getSelectedItem() !== null) {
					year = this.byId("idoSelect1").getSelectedKey();
				}
				if (this.byId("idoSelect2").getSelectedItem() !== null) {
					term = this.byId("idoSelect2").getSelectedKey();
				}
				if (subKey !== null && year !== null && term !== null) {
					NView.SubData = {
						"SubjectID": subKey,
						"Year": year,
						"GradeFlag": "X",
						"Term": term
					};
					var dialog_submit = new sap.m.Dialog({
						title: 'Warning',
						type: 'Message',
						state: 'Warning',
						content: new sap.m.Text({
							text: "Once Grades are submited cannot be reverted back, Are you sure you want to submit?"
						}),
						beginButton: new sap.m.Button({
							text: 'Submit',
							press: function() {
								var oDataModel = new sap.ui.model.odata.v2.ODataModel(NView.sUrl, {
									json: true,
									loadMetadataAsync: true
								});
								oDataModel.create("/SubmitDataSet", NView.SubData, {
									success: function(oData, response) {
										var dialog_success = new sap.m.Dialog({
											title: 'Success',
											type: 'Message',
											state: 'Success',
											content: new sap.m.Text({
												text: "Submitted Successfully"
											}),
											beginButton: new sap.m.Button({
												text: 'OK',
												press: function() {
													dialog_success.close();
												}
											}),
											afterClose: function() {
												dialog_success.destroy();
											}
										});
										dialog_success.open();
									},
									error: function(oError) {
										var dialog_err = new sap.m.Dialog({
											title: 'Error',
											type: 'Message',
											state: 'Error',
											content: new sap.m.Text({
												text: JSON.parse(oError.responseText).error.message.value
											}),
											beginButton: new sap.m.Button({
												text: 'OK',
												press: function() {
													dialog_err.close();
												}
											}),
											afterClose: function() {
												dialog_err.destroy();
											}
										});
										dialog_err.open();
									}
								});
								dialog_submit.close();
							}
						}),
						endButton: new sap.m.Button({
							text: 'Cancel',
							press: function() {
								dialog_submit.close();
							}
						}),
						afterClose: function() {
							dialog_submit.destroy();
						}
					});
					dialog_submit.open();
				} else {
					var dialog_err = new sap.m.Dialog({
						title: 'Error',
						type: 'Message',
						state: 'Error',
						content: new sap.m.Text({
							text: "Please make sure Year, Term and Subject is selected to Submit"
						}),
						beginButton: new sap.m.Button({
							text: 'OK',
							press: function() {
								dialog_err.close();
							}
						}),
						afterClose: function() {
							dialog_err.destroy();

						}
					});
					dialog_err.open();
				}
			} else {
				var dialog_errDate = new sap.m.Dialog({
					title: 'Error',
					type: 'Message',
					state: 'Error',
					content: new sap.m.Text({
						text: "Please input the Submission Date"
					}),
					beginButton: new sap.m.Button({
						text: 'OK',
						press: function() {
							dialog_errDate.close();
						}
					}),
					afterClose: function() {
						dialog_errDate.destroy();

					}
				});
				dialog_errDate.open();
			}
		},
		saveAllScoreValidation: function() {
			var sDta = this.getView().getModel("StudentDetails").getData().Value;
			if (sDta[0].MYP_TYPE == "BF") {
				if (sDta[0].ST1_SCORE === "" && sDta[0].ST2_SCORE === "" && sDta[0].ST3_SCORE === "" && sDta[0].EXAM_SCORE === "") {
					return 'NST';
				}

			}
			var A_S = 0,
				B_S = 0,
				C_S = 0,
				D_S = 0,
				A_E = 0,
				B_E = 0,
				C_E = 0,
				D_E = 0,
				BF_S = 0,
				BF_E = 0;
			for (var i = 0; i < sDta.length; i++) {
				if (this.tasktype === '1' || this.tasktype === '2' || this.tasktype === '3' || this.tasktype === '6') {
					if (sDta[i].A_SCORE === "") {
						A_E = A_E + 1;
					} else {
						A_S = A_S + 1;
					}
					if (sDta[i].B_SCORE === "") {
						B_E = B_E + 1;
					} else {
						B_S = B_S + 1;
					}
					if (sDta[i].C_SCORE === "") {
						C_E = C_E + 1;
					} else {
						C_S = C_S + 1;
					}
					if (sDta[i].D_SCORE === "") {
						D_E = D_E + 1;
					} else {
						D_S = D_S + 1;
					}
				} else if (this.tasktype === '4') {
					if (sDta[i].SCORE === "") {
						BF_E = BF_E + 1;
					} else {
						BF_S = BF_S + 1;
					}

				}
			}
			if (A_S > 0) {
				if (A_E > 0) {
					return 'A';
				}
			}
			if (B_S > 0) {
				if (B_E > 0) {
					return 'B';
				}
			}
			if (C_S > 0) {
				if (C_E > 0) {
					return 'C';
				}
			}
			if (D_S > 0) {
				if (D_E > 0) {
					return 'D';
				}
			}
			if (BF_S > 0) {
				if (BF_E > 0) {
					return 'BF';
				}
			}
			return "";
		},
		onSave: function() {
			var that = this;
			var scoreFlag = that.saveAllScoreValidation();
			if (scoreFlag === "") {
				var check = that.comentValidation();
				var checkScore = that.updateScore();
				if (this.tasktype === '4') {
					that.byId("input8").setValue("Best Fit");
				}
				if (this.tasktype === '5') {
					that.byId("input8").setValue("Attitude Grade");
				}
				if (this.tasktype === '7') {
					that.byId("input8").setValue("Comment");
				}
				if (this.tasktype === '8') {
					that.byId("input8").setValue("Attendance");
				}
				if (this.tasktype === '9') {
					that.byId("input8").setValue("Punctuality");
				}
				if (this.tasktype === '10') {
					that.byId("input8").setValue("Level");
				}
				if (!checkScore && check && parseInt(that.byId("DTI1").getValue()) !== 0 && that.byId("DTI1").getValue() !== "" && that.byId(
						"input8").getValue() !== "") {
					this.ModelSu = new sap.ui.model.odata.v2.ODataModel(that.sUrl, {
						json: true,
						loadMetadataAsync: true
					});
					var obj = that.getView().getModel("StudentDetails").getData().Value;
					var objS = {};
					objS.sub_mypstudent = [];
					if (that.tasktype === "1") {
						that.AppraisalType = "ST1";
					} else if (that.tasktype === "2") {
						that.AppraisalType = "ST2";
					} else if (that.tasktype === "3") {
						that.AppraisalType = "ST3";
					} else if (that.tasktype === "5") {
						that.AppraisalType = "AG";
					} else if (that.tasktype === "6") {
						that.AppraisalType = "EX";
					} else if (that.tasktype === "7") {
						that.AppraisalType = "COMM";
					} else if (that.tasktype === "8") {
						that.AppraisalType = "AT";
					} else if (that.tasktype === "9") {
						that.AppraisalType = "PU";
					} else if (that.tasktype === "10") {
						that.AppraisalType = "LE";
					}

					for (var i = 0; i < obj.length; i++) {
						var temp = {
							MYP_TYPE: obj[0].MYP_TYPE,
							MYP_TASK: that.AppraisalType,
							MYP_ASSIGNMENT: obj[0].MYP_ASSIGNMENT,
							MYP_ASS_TYPE: that.AppraisalType,
							SCORE_DATE: obj[0].SCORE_DATE,
							SCORE: obj[i].SCORE,
							STUDENT_ID: obj[i].STUDENT_ID,
							SubjectID: obj[i].SubjectID,
							Term: obj[i].Term,
							Year: obj[i].Year,
							COMMENTS: obj[i].REMARKS1,
							SEQ_NO: "1",
							STUDENT_NAME: obj[i].STUDENT_NAME,
							A_SCORE: obj[i].A_SCORE,
							B_SCORE: obj[i].B_SCORE,
							C_SCORE: obj[i].C_SCORE,
							D_SCORE: obj[i].D_SCORE,
							ST1_SCORE: obj[i].ST1_SCORE,
							ST2_SCORE: obj[i].ST2_SCORE,
							ST3_SCORE: obj[i].ST3_SCORE,
							AVG_SCORE: obj[i].AVG_SCORE,
							SCORE_LAST_TERM: obj[i].SCORE_LAST_TERM

						};
						objS.sub_mypstudent.push(temp);
					}
					objS.ObjectId = obj[0].SubjectID;
					objS.responseText = that.uName;
					objS.MYP = "T";
					this.ModelSu.create("/timetableSet", objS, {
						success: function(oData) {
							//	debugger;
							if (oData.responseType === "S" || oData.responseType === "") {
								that.getView().getModel("StudentDetails").refresh();
								var dialog_3 = new sap.m.Dialog({
									title: 'Success',
									type: 'Message',
									state: 'Success',
									content: new sap.m.Text({
										text: "Updates saved."
									}),
									beginButton: new sap.m.Button({
										text: 'OK',
										press: function() {
											dialog_3.close();
										}
									}),
									afterClose: function() {
										dialog_3.destroy();
										that.handleSelectionChange4();
									}
								});
								dialog_3.open();
							} else {
								sap.ui.core.BusyIndicator.hide();
								var dialog_4 = new sap.m.Dialog({
									title: 'Error',
									type: 'Message',
									state: 'Error',
									content: new sap.m.Text({
										text: oData.responseText
									}),
									beginButton: new sap.m.Button({
										text: 'OK',
										press: function() {
											dialog_4.close();
										}
									}),
									afterClose: function() {
										dialog_4.destroy();
									}
								});
								dialog_4.open();
								that.handleSelectionChange4();
							}
						},
						error: function(oError) {
							var dialog_5 = new sap.m.Dialog({
								title: 'Error',
								type: 'Message',
								state: 'Error',
								content: new sap.m.Text({
									text: 'Please ensure all mandatory fields are entered correctly.'
								}),
								beginButton: new sap.m.Button({
									text: 'OK',
									press: function() {
										dialog_5.close();
									}
								}),
								afterClose: function() {
									dialog_5.destroy();
								}
							});
							dialog_5.open();
						}
					});
				} else {
					if (check) {
						var dialog_1 = new sap.m.Dialog({
							title: 'Error',
							type: 'Message',
							state: 'Error',
							content: new sap.m.Text({
								text: 'Please ensure all mandatory fields are entered correctly.'
							}),
							beginButton: new sap.m.Button({
								text: 'OK',
								press: function() {
									dialog_1.close();
								}
							}),
							afterClose: function() {
								dialog_1.destroy();
							}
						});
						dialog_1.open();
					}
				}
			} else {
				var msg = "";
				if (scoreFlag === "A") {
					msg = "Please ensure scores are given to all Students for ST1-A";
				} else if (scoreFlag === "B") {
					msg = "Please ensure scores are given to all Students for ST1-B";
				} else if (scoreFlag === "C") {
					msg = "Please ensure scores are given to all Students for ST1-C";
				} else if (scoreFlag === "D") {
					msg = "Please ensure scores are given to all Students for ST1-D";
				} else if (scoreFlag === "BF") {
					msg = "Please ensure scores are given to all Students for Best Fit";
				} else if (scoreFlag === "NST") {
					msg = "Please ensure scores are given to at least one ST";
				}

				var dialog_sc = new sap.m.Dialog({
					title: 'Error',
					type: 'Message',
					state: 'Error',
					content: new sap.m.Text({
						text: msg
					}),
					beginButton: new sap.m.Button({
						text: 'OK',
						press: function() {
							dialog_sc.close();
						}
					}),
					afterClose: function() {
						dialog_sc.destroy();
					}
				});
				dialog_sc.open();
			}
		},
		comentValidation: function(oEvent) {
			if (oEvent) {
				if (oEvent.getSource().getValue().indexOf("{") !== -1 || oEvent.getSource().getValue().indexOf("{") !== -1) {
					oEvent.getSource().setValue("");
					var dialogerror = new sap.m.Dialog({
						title: 'Error',
						type: 'Message',
						state: 'Error',
						content: new sap.m.Text({
							text: 'Comment Cannot Contain Currly braces'
						}),
						beginButton: new sap.m.Button({
							text: 'OK',
							press: function() {
								dialogerror.close();
							}
						}),
						afterClose: function() {
							dialogerror.destroy();
						}
					});
					dialogerror.open();
				}
			}
			var that = this;
			var obj = that.getView().getModel("StudentDetails").getData().Value;
			var flag2 = 0;
			for (var i = 0; i < obj.length; i++) {
				if (obj[i].REMARKS1.length > obj[i].MAX_COMMENT_LENGTH) {
					var messageText = "Maximum comment length is " + obj[i].MAX_COMMENT_LENGTH + " characters, please reduce for student:" + obj[i].FirstName +
						".";
					if (!flag2) {
						var dialog2 = new sap.m.Dialog({
							title: 'Error',
							type: 'Message',
							state: 'Error',
							content: new sap.m.Text({
								text: messageText
							}),
							beginButton: new sap.m.Button({
								text: 'OK',
								press: function() {
									dialog2.close();
								}
							}),
							afterClose: function() {
								dialog2.destroy();
							}
						});
						dialog2.open();
						flag2++;
					}
					return 0;
				}
			}
			return 1;
		},
		updateScore1: function(oEvent) {
			if (oEvent) {
				if (/^[a-zA-Z0-9]*$/.test(oEvent.getSource().getValue()) === false) {
					oEvent.getSource().setValue("");
					var dialogComma = new sap.m.Dialog({
						title: 'Error',
						type: 'Message',
						state: 'Error',
						content: new sap.m.Text({
							text: 'Special characters are not allowed.'
						}),
						beginButton: new sap.m.Button({
							text: 'OK',
							press: function() {
								dialogComma.close();
							}
						}),
						afterClose: function() {
							dialogComma.destroy();
						}
					});
					dialogComma.open();
				} else if (oEvent.getSource().getValue() !== 'X') {
					if (Number.isInteger(Number(oEvent.getSource().getValue()))) {
						oEvent.getSource().setValueStateText("");
						if (parseInt(oEvent.getSource().getValue()) < 0) {
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
									press: function() {
										dialogNeg.close();
									}
								}),
								afterClose: function() {
									dialogNeg.destroy();
								}
							});
							dialogNeg.open();
						} else {
							this.updateScore(oEvent);
						}
					} else {
						oEvent.getSource().setValue("");
						var dialog2_1 = new sap.m.Dialog({
							title: 'Error',
							type: 'Message',
							state: 'Error',
							content: new sap.m.Text({
								text: 'Please enter a number or X.'
							}),
							beginButton: new sap.m.Button({
								text: 'OK',
								press: function() {
									dialog2_1.close();
									return;
								}
							}),
							afterClose: function() {
								dialog2_1.destroy();
							}
						});
						dialog2_1.open();
					}
				} else {
					oEvent.getSource().setValueState("None");
					this.updateScore(oEvent);
				}
			}
		},
		updateScore: function(oEvent) {
			var that = this;
			var obj = that.getView().getModel("StudentDetails").getData().Value;
			var validation = that.byId("maxScore").getValue();
			if (!parseFloat(validation)) {
				that.byId("maxScore").setValue("");
			}
			that.byId("maxScore").setValueState("None");
			var temp1 = null,
				temp2 = null,
				temp3 = null;
			var count = 0,
				flag = 0,
				flag2 = 0,
				flag2_2 = 0,
				flag2_3 = 0,
				flag2_4 = 0,
				flag2_5 = 0,
				flag2_6 = 0,
				returnValue = 0;
			for (var i = 0; i < obj.length; i++) {
				if (that.tasktype === "1" || that.tasktype === "2" || that.tasktype === "3" || that.tasktype === "6") {
					if (!parseFloat(obj[i].A_SCORE) && parseFloat(obj[i].A_SCORE) !== 0) {
						if (obj[i].A_SCORE === "" || obj[i].A_SCORE === " ") {
							count++;
						} else if (obj[i].A_SCORE === "X") {
							//	continue;
						} else {
							if (!flag2) {
								var dialog2_1 = new sap.m.Dialog({
									title: 'Error',
									type: 'Message',
									state: 'Error',
									content: new sap.m.Text({
										text: 'Wrong Grade.'
									}),
									beginButton: new sap.m.Button({
										text: 'OK',
										press: function() {
											dialog2_1.close();
										}
									}),
									afterClose: function() {
										dialog2_1.destroy();
									}
								});
								dialog2_1.open();
								flag2++;
								returnValue++;
							}
						}
					}

					if (!parseFloat(obj[i].B_SCORE) && parseFloat(obj[i].B_SCORE) !== 0) {
						if (obj[i].B_SCORE === "" || obj[i].B_SCORE === " ") {
							count++;
						} else if (obj[i].B_SCORE === "X") {
							//continue;
						} else {
							if (!flag2_2) {
								var dialog2_2 = new sap.m.Dialog({
									title: 'Error',
									type: 'Message',
									state: 'Error',
									content: new sap.m.Text({
										text: 'Wrong Grade.'
									}),
									beginButton: new sap.m.Button({
										text: 'OK',
										press: function() {
											dialog2_2.close();
										}
									}),
									afterClose: function() {
										dialog2_2.destroy();
									}
								});
								dialog2_2.open();
								flag2_2++;
								returnValue++;
							}
						}
					}
					if (!parseFloat(obj[i].C_SCORE) && parseFloat(obj[i].C_SCORE) !== 0) {
						if (obj[i].C_SCORE === "" || obj[i].C_SCORE === " ") {
							count++;
						} else if (obj[i].C_SCORE === "X") {
							//	continue;
						} else {
							if (!flag2_3) {
								var dialog2_3 = new sap.m.Dialog({
									title: 'Error',
									type: 'Message',
									state: 'Error',
									content: new sap.m.Text({
										text: 'Wrong Grade.'
									}),
									beginButton: new sap.m.Button({
										text: 'OK',
										press: function() {
											dialog2_3.close();
										}
									}),
									afterClose: function() {
										dialog2_3.destroy();
									}
								});
								dialog2_3.open();
								flag2_3++;
								returnValue++;
							}
						}
						//continue;
					}
					if (!parseFloat(obj[i].D_SCORE) && parseFloat(obj[i].D_SCORE) !== 0) {
						if (obj[i].D_SCORE === "" || obj[i].D_SCORE === " ") {
							count++;
						} else if (obj[i].D_SCORE === "X") {
							continue;
						} else {
							if (!flag2_4) {
								var dialog2_4 = new sap.m.Dialog({
									title: 'Error',
									type: 'Message',
									state: 'Error',
									content: new sap.m.Text({
										text: 'Wrong Grade.'
									}),
									beginButton: new sap.m.Button({
										text: 'OK',
										press: function() {
											dialog2_4.close();
										}
									}),
									afterClose: function() {
										dialog2_4.destroy();
									}
								});
								dialog2_4.open();
								flag2_4++;
								returnValue++;
							}
						}
					}
					if (parseFloat(validation) < parseFloat(obj[i].A_SCORE) ||
						parseFloat(validation) < parseFloat(obj[i].B_SCORE) ||
						parseFloat(validation) < parseFloat(obj[i].C_SCORE) ||
						parseFloat(validation) < parseFloat(obj[i].D_SCORE)) {
						if (parseFloat(validation) < parseFloat(obj[i].A_SCORE)) {
							this.getView().byId("idTable1").getRows()[i].getCells()[2].setValue("");
						} else if (parseFloat(validation) < parseFloat(obj[i].B_SCORE)) {
							this.getView().byId("idTable1").getRows()[i].getCells()[3].setValue("");
						} else if (parseFloat(validation) < parseFloat(obj[i].C_SCORE)) {
							this.getView().byId("idTable1").getRows()[i].getCells()[4].setValue("");
						} else if (parseFloat(validation) < parseFloat(obj[i].D_SCORE)) {
							this.getView().byId("idTable1").getRows()[i].getCells()[5].setValue("");
						}
						that.byId("maxScore").setValueState("Error");

						if (!flag) {
							var dialog = new sap.m.Dialog({
								title: 'Error',
								type: 'Message',
								state: 'Error',
								content: new sap.m.Text({
									text: 'Grade entered should not be greater than max score.'
								}),
								beginButton: new sap.m.Button({
									text: 'OK',
									press: function() {
										dialog.close();
									}
								}),
								afterClose: function() {
									dialog.destroy();
								}
							});
							dialog.open();
							flag++;
							returnValue++;
						}
					}
				} else if (that.tasktype === "4") {
					if (!parseFloat(obj[i].SCORE) && parseFloat(obj[i].SCORE) !== 0) {
						if (obj[i].SCORE === "" || obj[i].SCORE === " ") {
							count++;

						} else if (obj[i].SCORE === "M" || obj[i].SCORE === "P" || obj[i].SCORE === "X") {
							//continue;

						} else {
							if (!flag2_5) {
								var dialog2_5 = new sap.m.Dialog({
									title: 'Error',
									type: 'Message',
									state: 'Error',
									content: new sap.m.Text({
										text: 'Wrong Grade.'
									}),
									beginButton: new sap.m.Button({
										text: 'OK',
										press: function() {
											dialog2_5.close();
										}
									}),
									afterClose: function() {
										dialog2_5.destroy();
									}
								});
								dialog2_5.open();
								flag2_5++;
								returnValue++;
							}
						}
					}
					if (parseFloat(validation) < parseFloat(obj[i].SCORE)) {
						that.byId("maxScore").setValueState("Error");
						if (oEvent) {
							oEvent.getSource().setValue("");
						}
						if (!flag) {
							var dialog = new sap.m.Dialog({
								title: 'Error',
								type: 'Message',
								state: 'Error',
								content: new sap.m.Text({
									text: 'Grade entered should not be grater than Max score.'
								}),
								beginButton: new sap.m.Button({
									text: 'OK',
									press: function() {
										dialog.close();
									}
								}),
								afterClose: function() {
									dialog.destroy();
								}
							});
							dialog.open();
							flag++;
							returnValue++;
						}
					}
				} else if (that.tasktype === "10") {
					if (!parseFloat(obj[i].SCORE) && parseFloat(obj[i].SCORE) !== 0) {
						if (obj[i].SCORE === "" || obj[i].SCORE === " ") {
							count++;
						} else {
							if (!flag2_6) {
								var dialog2_6 = new sap.m.Dialog({
									title: 'Error',
									type: 'Message',
									state: 'Error',
									content: new sap.m.Text({
										text: 'Wrong Grade.'
									}),
									beginButton: new sap.m.Button({
										text: 'OK',
										press: function() {
											dialog2_6.close();
										}
									}),
									afterClose: function() {
										dialog2_6.destroy();
									}
								});
								dialog2_6.open();
								flag2_6++;
								returnValue++;
							}
						}
					}
					if (parseFloat(validation) < parseFloat(obj[i].SCORE)) {
						that.byId("maxScore").setValueState("Error");
						if (oEvent) {
							oEvent.getSource().setValue("");
						}
						if (!flag) {
							var dialog = new sap.m.Dialog({
								title: 'Error',
								type: 'Message',
								state: 'Error',
								content: new sap.m.Text({
									text: 'Grade entered should not be grater than Max score.'
								}),
								beginButton: new sap.m.Button({
									text: 'OK',
									press: function() {
										dialog.close();
									}
								}),
								afterClose: function() {
									dialog.destroy();
								}
							});
							dialog.open();
							flag++;
							returnValue++;
						}
					}

				}
				if (!temp1) {
					temp1 = parseFloat(obj[i].SCORE);
				} else {
					if (temp1 < parseFloat(obj[i].SCORE)) {
						temp1 = parseFloat(obj[i].SCORE);
					}
				}
				if (!temp2) {
					temp2 = parseFloat(obj[i].SCORE);
				} else if (temp2 > parseFloat(obj[i].SCORE)) {
					temp2 = parseFloat(obj[i].SCORE);
				}
				if (!temp3) {
					temp3 = parseFloat(obj[i].SCORE);
				} else {
					if (!isNaN(parseFloat(obj[i].SCORE))) {
						temp3 = temp3 + parseFloat(obj[i].SCORE);
					} else {
						temp3 = temp3;
					}
				}
			}
			temp3 = temp3 / obj.length;
			if (!temp1) {
				temp1 = "";
			}
			if (!temp2) {
				temp2 = "";
			}
			if (!temp3 || temp1 === "") {
				temp3 = "";
				this.byId("avg").setValue(temp3);
			} else {
				this.byId("avg").setValue(temp3.toFixed(2));
			}
			this.byId("maxMin").setValue(temp1 + " / " + temp2);

			this.byId("blank").setValue(count);
			return returnValue;
		},
		dateValidation: function(oEvent) {
			var date = oEvent.getSource().getDateValue();
			var today = new Date();
			if (date > today) {
				oEvent.getSource().setValueState("Error");
				oEvent.getSource().setValueStateText("Date cannot be in the future.");
				oEvent.getSource().setValue("00000000");
			} else {
				oEvent.getSource().setValueState("None");
			}
		},
		onPress: function(oEvent) {
			var that = this;
			NView = this;
			var index = oEvent.getSource()._getPropertiesToPropagate().oBindingContexts.StudentDetails.sPath.split("/")[2];
			var dialog_2 = new sap.m.Dialog({
				title: 'Notes',
				type: 'Message',
				state: 'None',
				content: new sap.m.TextArea({
					value: that.getView().getModel("StudentDetails").getData().Value[index].REMARKS1,
					showExceededText: true,
					maxLength: parseInt(that.getView().getModel("StudentDetails").getData().Value[index].MAX_COMMENT_LENGTH),
					growing: true,
					rows: 10,
					width: "100%",
					liveChange: that.handleLiveChange,
					valueLiveUpdate: true
				}),
				beginButton: new sap.m.Button({
					text: 'OK',
					press: function() {
						dialog_2.close();
						NView.getView().getModel("StudentDetails").getData().Value[index].REMARKS1 = oEvent.getSource().getParent().getContent()[0]
							.getValue();
						NView.getView().getModel("StudentDetails").refresh();
					}
				}),
				afterClose: function() {
					dialog_2.destroy();
				}
			});
			dialog_2.open();
		}
	});

});