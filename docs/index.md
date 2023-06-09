---
title: 基础用法
---

<script>
import {VirtualTree} from 'lc-vue-virtual-tree'
import { v4 as uuidv4 } from 'uuid';

export default {
  name:'demo',
  components:{VirtualTree},
  data () {
    return {
      treeData: [
        {
          title: '第一层级',
          key: '0-0',
          children: [
            {
              title: '子层级',
              key: '0-0-0',
              disabled: true,
              children: [
                { title: '键盘', key: '0-0-0-0', disableCheckbox: true },
                { title: '鼠标', key: '0-0-0-1', lll: true }
              ]
            },
            {
              title: '金属',
              key: '0-0-1',
              children: [
                { title: '钢铁', key: '0-0-1-0' },
                {
                  title: '铝合金',
                  key: '0-0-1-1',
                  children: [
                    { title: '断桥铝', key: '0-0-1-1-0' }
                  ]
                }
              ]
            }
          ]
        }
      ],
      checkedKeys: [],
      expandedKeys: [],
      selectedKey: null
    }
  },
  mounted(){
    // this.createScrollHandle()
  },
  methods: {
    onSelect (selectedKey, event) {
      console.log(selectedKey, event)
    },
    onCheck (checkedKeys, event) {
      console.log(checkedKeys, event)
    },
    onExpand (expandKeys, event) {
      console.log(expandKeys, event)
    },
    onLoad () {
      console.log('load')
    },
    loadData(node){
      return new Promise((resolve)=>{
        setTimeout(()=>{
          resolve([
            { title: '开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关开关', key:uuidv4() , lll: true },
                {
                  title: '插座',
                  key: uuidv4(),
                }
          ])
        }, 10)
      })
    }
  },
  watch: {
    checkedKeys: {
      deep: true,
      handler (val) {
        console.log('checkedKeys', val)
      }
    },
    expandedKeys: {
      deep: true,
      handler (val) {
        console.log('expandedKeys', val)
      }
    },
    selectedKey (val) {
      console.log('selectedKey', val)
    }
  }
}
</script>

# 基础用法

<el-card>
    <div>{{checkedKeys}}</div>
    <div style="width:300px; height: 500px; overflow: auto" ref="container">
      <VirtualTree
        :treeData="treeData"
        v-model="checkedKeys"
        :expandedKeys.sync="expandedKeys"
        :selectedKey.sync="selectedKey"
        :defaultCheckedKeys="['0-0-0-1', '0-0-1-0']"
        :defaultExpandedKeys="['0-0-0', '0-0-1', '0-0-1-0', '0-0-1-1']"
        defaultSelectedKey="0-0-0-1"
        :loadData="loadData"
        :replaceFields="{isLeaf: 'lll'}"
        :checkable="true"
        :titleWidth="100"
        @select="onSelect"
        @check="onCheck"
        @expand="onExpand"
        @load="onLoad"
        >
          <template #suffix="{node}">
            <el-button type="primary" link>1</el-button>
            <el-button type="primary" link>2</el-button>
            <el-button type="primary" link>2</el-button>
            <el-button type="primary" link>2</el-button>
          </template>
          <template #title-suffix>
            <i class="aps-icon-edit"></i>
          </template>
      </VirtualTree>
    </div>
  </el-card>