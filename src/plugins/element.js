import Vue from 'vue'
import { Button, Input, Message, MessageBox, Pagination, Card, Container, Table } from 'element-ui'

Vue.use(Button)
Vue.use(Input)
Vue.use(Pagination)
Vue.use(Card)
Vue.use(Container)
Vue.use(Table)
Vue.prototype.$message = Message;
Vue.prototype.$confirm = MessageBox.confirm
Vue.$sreenWidth = document.body.clientWidth