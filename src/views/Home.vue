<template>
  <div style="text-align: center;">
    <el-dialog
      :visible.sync="ensured"
      :width="this.$device.isDesktop ? '70%':'95%'"
      style="text-align: center;"
    >
      <div
        v-if="cutFinished===false"
        :style="{width: '100%', height: this.$device.isDesktop ? '350px':'500px'}"
      >
        <vueCropper
          ref="cropper"
          :img="imgToCut.img"
          :outputSize="imgToCut.size"
          :outputType="imgToCut.type"
          :fixed="imgToCut.isFixed"
          :fixedNumber="imgToCut.fixedRate"
          :autoCrop="imgToCut.autoCrop"
          :autoCropWidth="imgToCut.autoCropWidth"
          :autoCropHeight="imgToCut.autoCropHeight"
          :centerBox="false"
        ></vueCropper>
      </div>
      <el-button
        v-if="cutFinished===false"
        type="success"
        style="margin: 20px;"
        @click="finishCut"
      >裁剪完成</el-button>
      <el-form v-if="cutFinished===true" ref="user" v-model="form" style="text-align: center;">
        <el-form-item
          label="已背总天数"
          :rules="[
            { required: true, message: '天数不能为空'},
            { type: 'number', message: '天数必须为数字值'}
          ]"
        >
          <el-input v-model.number="form.daynum"></el-input>
        </el-form-item>
        <el-form-item 
          label="今日单词数"
          :rules="[
            { required: true, message: '单词数不能为空'},
            { type: 'number', message: '单词数必须为数字值'}
          ]"
        >
          <el-input v-model.number="form.wordnum"></el-input>
        </el-form-item>
        <el-form-item
          label="打卡日期"
          :rules="[
            { required: true, message: '日期不能为空'},
          ]"
        >
          <el-date-picker
            v-model="form.currentDate"
            type="date"
            placeholder="选择日期"
            format="yyyy 年 MM 月 dd 日"
            value-format="timestamp">
          ></el-date-picker>
        </el-form-item>
        <el-button type="primary" style="margin: 20px;" @click="finishChoose">确认提交</el-button>
      </el-form>
    </el-dialog>
    <el-row type="flex" justify="center" align="center">
      <el-col
        v-if="allDone===false"
        :span="this.$device.isDesktop ? 12 : 22"
        style="text-align: center;"
      >
        <el-upload
          class="upload-demo"
          action
          drag
          :on-change="uploadFileDone"
          :on-remove="handleRemove"
          :on-exceed="handleExceed"
          :file-list="fileList"
          :auto-upload="false"
          :limit="1"
          style="text-align: center; margin-top: 20%;"
        >
          <i v-if="imgUrl===''" class="el-icon-upload"></i>
          <img v-if="imgUrl!==''" :src="imgUrl" width="100%" />
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过5MB</div>
        </el-upload>
        <el-button type="primary" style="margin: 20px;" @click="function(){ensured=true;}">确认上传</el-button>
      </el-col>
      <el-col
        v-if="allDone===true"
        :span="this.$device.isDesktop ? 12 : 22"
        style="text-align: center; margin-top: 30px;"
      > 
        <img src="../assets/QRCode.png" id="QRCode" hidden>
        <img :src="adUrl" id="ad" hidden />
        <img src="../assets/百词斩.png" id="icon" width="20" hidden />
        <img src="../assets/calendar.png" id="calendar" width="20" hidden />
        <img id="bg" :src="backgroundUrl" width="450px" hidden />
        <canvas id="res" :width="bgInfo.width" :height="bgInfo.height" hidden></canvas>
        <img :src="finalResultUrl" width="450px" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
//https://android.myapp.com/myapp/detail.htm?apkName=com.jiongji.andriod.card&ADTAG=mobile
//num: condensed
//word: Jackey_HandWrite Regular
import { VueCropper } from "vue-cropper";
import {
  Upload,
  Button,
  Row,
  Col,
  Dialog,
  Form,
  FormItem,
  Input,
  DatePicker
} from "element-ui";
export default {
  components: {
    vueCropper: VueCropper,
    "el-button": Button,
    "el-upload": Upload,
    "el-row": Row,
    "el-col": Col,
    "el-dialog": Dialog,
    "el-form": Form,
    "el-form-item": FormItem,
    "el-input": Input,
    "el-date-picker": DatePicker
  },
  data() {
    return {
      disabled: false,
      imgFile: undefined,
      fileList: [],
      imgUrl: "",
      ensured: false,
      imgToCut: {
        img: "",
        size: 1,
        type: "png",
        isFixed: true,
        fixedRate: [955, 1274],
        autoCrop: true,
        autoCropWidth: 955,
        autoCropHeight: 1274
      },
      cutFinished: false,
      allDone: false,
      backgroundUrl: "",
      /*randomWordUrl: "",
      phoneticUrl: "",*/
      QRCodeUrl: "",
      adUrl: "",
      finalResultUrl: "",
      bgInfo: {
        width: 0,
        height: 0
      },
      form: {
        daynum: 0,
        wordnum: 0,
        currentDate: 1592839849000
      }
    };
  },
  mounted() {},
  methods: {
    handleRemove(file, fileList) {
      file = 0;
      this.fileList = fileList;
      this.disabled = false;
      this.imgFile = undefined;
      this.fileList = [];
      this.imgUrl = "";
    },
    handleExceed(files, fileList) {
      console.log(files, fileList);
      if (files.length === 1 && this.fileList.length === 1) {
        const file = files[0];
        const fileType = file.type === undefined ? file.raw.type : file.type;
        //console.log(fileType);
        if (
          fileType !== "image/jpg" &&
          fileType !== "image/png" &&
          fileType !== "image/jpeg"
        ) {
          //console.log("???????");
          this.$message({
            message: "只能上传图片！",
            type: "warning",
            center: "true",
            customClass: "message"
          });
          return;
        }
        this.imgFile = files[0];
        this.fileList = Array(files);
        this.imgUrl = URL.createObjectURL(this.imgFile);
        this.imgToCut.img = this.imgUrl;
        return;
      }
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    uploadFileDone(file, fileList) {
      this.disabled = true;
      //限制上传文件为5M
      var sizeIsSatisfy =
        file.size < 10 * 1024 * 1024 || !file.name.includes("|");
      const fileType = file.type === undefined ? file.raw.type : file.type;
      //console.log(fileType);
      if (
        fileType !== "image/jpg" &&
        fileType !== "image/png" &&
        fileType !== "image/jpeg"
      ) {
        //console.log("???????");
        this.$message({
          message: "只能上传图片！",
          type: "warning",
          center: "true",
          customClass: "message"
        });
        this.disabled = false;
        this.imgFile = undefined;
        this.fileList = [];
        this.imgUrl = "";
        return false;
      }
      if (!sizeIsSatisfy) {
        this.$message({
          message: "文件不符合规范！",
          type: "warning",
          center: "true",
          customClass: "message"
        });
        this.fileList.pop();
        this.disabled = false;
        this.imgFile = undefined;
        this.fileList = [];
        this.imgUrl = "";
        return false;
      }
      this.disabled = false;
      this.imgFile = file;
      this.fileList = fileList;
      this.imgUrl = URL.createObjectURL(file.raw);
      this.imgToCut.img = this.imgUrl;
      console.log(this.imgUrl);
      return true;
    },
    async finishChoose() {
      this.allDone = true;
      this.ensured = false;
      await setTimeout(() => {}, 200);
      this.toDrawImage();
    },
    finishCut() {
      this.cutFinished = false;
      this.bgInfo.width = 900;
      this.bgInfo.height = 1200;
      this.$refs["cropper"].getCropBlob(async data => {
        this.backgroundUrl = URL.createObjectURL(data);
        console.log(data);
        this.cutFinished = true;
        console.log(this.backgroundUrl);
      });
    },
    async toDrawImage() {
      /**
       * @author zhangxinxu(.com)
       * @licence MIT
       * @description http://www.zhangxinxu.com/wordpress/?p=7362
       */

      CanvasRenderingContext2D.prototype.letterSpacingText = function(
        text,
        x,
        y,
        letterSpacing
      ) {
        var context = this;
        var canvas = context.canvas;
        if (!letterSpacing && canvas) {
          letterSpacing = parseFloat(
            window.getComputedStyle(canvas).letterSpacing
          );
        }
        if (!letterSpacing) {
          return this.fillText(text, x, y);
        }
        var arrText = text.split("");
        var align = context.textAlign || "left";
        // 这里仅考虑水平排列
        var originWidth = context.measureText(text).width;
        // 应用letterSpacing占据宽度
        var actualWidth = originWidth + letterSpacing * (arrText.length - 1);
        // 根据水平对齐方式确定第一个字符的坐标
        if (align == "center") {
          x = x - actualWidth / 2;
        } else if (align == "right") {
          x = x - actualWidth;
        }
        // 临时修改为文本左对齐
        context.textAlign = "left";
        // 开始逐字绘制
        arrText.forEach(function(letter) {
          var letterWidth = context.measureText(letter).width;
          context.fillText(letter, x, y);
          // 确定下一个字符的横坐标
          x = x + letterWidth + letterSpacing;
        });
        // 对齐方式还原
        context.textAlign = align;
      };
      let background = document.getElementById("bg");
      console.log(background);
      let canvas = document.getElementById("res");
      background.width = this.bgInfo.width;
      background.height = this.bgInfo.height;
      console.log(background.width, background.height);
      let bgImage = new Image();
      console.log(document.getElementById("calendar"));
      bgImage.onload = () => {
        canvas
          .getContext("2d")
          .drawImage(bgImage, 0, 0, this.bgInfo.width, this.bgInfo.height);
        canvas
          .getContext("2d")
          .drawImage(document.getElementById("calendar"), 48, 482*2, 18*2, 18*2);
        canvas
          .getContext("2d")
          .drawImage(document.getElementById("icon"), 25*2, 25*2, 33*2, 33*2);
        canvas
          .getContext("2d")
          .drawImage(document.getElementById("QRCode"), 365*2, 496*2, 63*2, 63*2);
        let ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.font = "32px 微软雅黑"; //canvas字体
        ctx.fillStyle = "#fef9f3";
        ctx.letterSpacingText("我在百词斩背单词", 76*2, 48*2, 1);
        ctx.font = "32px Arial";
        let targetTime = new Date(this.form.currentDate);
        console.log(targetTime.toDateString());
        const days = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ];
        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ];
        let dateText = "";
        const texts = targetTime.toDateString().split(" ");
        texts.forEach(data => {
          days.forEach(day => {
            if (day.startsWith(data)) {
              dateText = dateText + day + ", ";
            }
          });
          months.forEach(month => {
            if (month.startsWith(data)) {
              dateText = dateText + month + " ";
            }
          });
        });
        dateText = dateText + texts[2].toString();
        console.log(dateText);
        ctx.letterSpacingText(dateText, 50*2, 498*2, 0);
        ctx.font = "70px Bahnschrift";
        ctx.fillText(this.form.wordnum.toString(), 24*2, 552*2, ctx.measureText(this.form.wordnum.toString()).width - 8);
        ctx.fillText(this.form.daynum.toString(), 118*2, 552*2, ctx.measureText(this.form.daynum.toString()).width - 8);
        ctx.font = " 100 26px 微软雅黑";
        ctx.fillStyle = "#DCDCDC";
        ctx.letterSpacingText("今日单词", 24*2, 572*2, 1);
        ctx.letterSpacingText("坚持天数", 118*2, 572*2, 1);
        ctx.font = " 100 18px 微软雅黑";
        ctx.letterSpacingText("扫码下载", 355*2, 572*2, 1);
        ctx.font = " 500 18px 微软雅黑";
        ctx.letterSpacingText("百词斩", 398*2, 572*2, 1);
        this.finalResultUrl = canvas.toDataURL("image/png");
      };
      bgImage.src = this.backgroundUrl;
    },
  }
};
</script>

<style lang="less" scoped>
/deep/ .el-upload-list__item-name {
  display: none;
}
/deep/ .el-upload-list .el-upload-list--text {
  display: none;
}
/deep/ .el-upload-list .is-success {
  display: none;
}
.message {
  margin-top: 2.2em;
  font-size: 20px;
  height: 2.5em;
}
</style>