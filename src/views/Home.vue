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
      <el-form v-if="cutFinished===true">
        <el-form-item>
          <el-input></el-input>
        </el-form-item>
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
        style="text-align: center;"
      >
        <img :src="adUrl" id="ad" hidden/>
        <img id="bg" :src="backgroundUrl" width="100%" hidden/>
        <img id="res" :src="finalResultUrl" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
//https://android.myapp.com/myapp/detail.htm?apkName=com.jiongji.andriod.card&ADTAG=mobile
//num: Brayden Sans
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
  Input
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
    "el-input": Input
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
      currentDateUrl: "",
      randomWordUrl: "",
      phoneticUrl: "",
      QRCodeUrl: "",
      adUrl: "",
      finalResultUrl: "",
      form: {
        daynum: 0,
        wordnum: 0
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
    finishCut() {
      this.$refs["cropper"].getCropBlob(async data => {
        console.log(data);
        this.ensured = false;
        this.cutFinished = true;
        this.allDone = true;
        this.backgroundUrl = URL.createObjectURL(data);
        console.log(this.backgroundUrl);
        await setTimeout(()=>{}, 200);
        this.toDrawImage();
      });
    },
    toDrawImage() {
      let background = document.getElementById("bg");
      console.log(background);
      let canvas = document.createElement("canvas");
      canvas
        .getContext("2d")
        .drawImage(background, 0, 0, background.width, background.height);
      let ctx = canvas.getContext("2d");
      ctx.font = "14px Microsoft YaHei"; //canvas字体
      ctx.fillStyle = "black";
      ctx.fillText("我在百词斩背单词", 10, 50);
      this.adUrl = canvas.toDataURL("image/png");
      this.finalResultUrl = canvas.toDataURL("image/png");
      console.log(canvas);
    }
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