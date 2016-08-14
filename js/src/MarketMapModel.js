/* Copyright 2015 Bloomberg Finance L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var widgets = require("jupyter-js-widgets");
var _ = require("underscore");
var d3 = require("d3");
var basemodel = require("./BaseModel");

var MarketMapModel = basemodel.BaseModel.extend({}, {

    defaults: _.extend({}, basemodel.BaseModel.prototype.defaults, {
        _model_name: "MarketMapModel",
        _view_name: "MarketMap",
        _model_module: "bqplot",
        _view_module: "bqplot",

        map_width: 1080,
        map_height: 800,

        names: [],
        groups: [],
        display_text: [],
        ref_data: undefined,
        title: "",

        tooltip_fields: [],
        tooltip_formats: [],
        show_groups: false,

        cols: 0,
        rows: 0,

        row_groups: 1,
        colors: d3.scale.category20().range(),
        scales: {},
        axes: [],
        color: [],
        map_margin: {
            top: 50,
            right: 50,
            left: 50,
            bottom: 50
        },
        preserve_aspect: false,
        stroke: "white",
        group_stroke: "black",
        selected_stroke: "dodgerblue",
        hovered_stroke: "orangered",
        font_style: {},
        title_style: {},

        selected: [],
        enable_hover: true,
        enable_select: true,
        tooltip_widget: null
    }),

    initialize: function() {
        MarketMapModel.__super__.initialize.apply(this, arguments);
        this.on_some_change(["names", "groups", "display_text", "ref_data"], function() {
            this.update_data();
            this.trigger("data_updated");
        }, this);
        this.on_some_change(["color"], function() {
            this.update_data();
            this.trigger("color_updated");
        });
        this.update_data();
    },

    update_data: function() {
        var that = this;
        this.data = this.get_typed_field("names");
        this.ref_data = this.get("ref_data");
        this.group_data = this.get_typed_field("groups");
        this.groups = _.uniq(this.group_data, true);
        var display_text = this.get_typed_field("display_text");
        display_text = (display_text === undefined || display_text.length === 0) ? this.data : display_text;

        this.colors = this.get("colors");
        var num_colors = this.colors.length;
        var color_data = this.get_typed_field("color");
        var mapped_data = this.data.map(function(d, i) {
            return {
                display: display_text[i],
                name: d,
                color: color_data[i],
                group: that.group_data[i],
                ref_data: (that.ref_data[i]) ? that.ref_data[i] : d
            };
        });

        this.update_domains();
        this.grouped_data = _.groupBy(mapped_data, function(d, i) { return that.group_data[i]; });

    },

    update_domains: function() {
        var color_scale_model = this.get("scales").color;
        var color_data = this.model.get_typed_field("color");
        if(color_scale_model && color_data.length > 0) {
            color_scale_model.compute_and_set_domain(color_data, this.model.id);
        }
    },

    serializers: _.extend({
        scales: { deserialize: widgets.unpack_models },
        axes: { deserialize: widgets.unpack_models },
        tooltip_widget: { deserialize: widgets.unpack_models },
        style: { deserialize: widgets.unpack_models },
        layout:  { deserialize: widgets.unpack_models }
    }, basemodel.BaseModel.serializers)
});

module.exports = {
    MarketMapModel: MarketMapModel
};
