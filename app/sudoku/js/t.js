var A;
var B;
var result; //用于存放答案
var finish; //是否找打解

function inputByString() {
	A = new Array();
	B = new Array();

	str = '800000000003600000070090200050007000000045700000100030001000068008500010090000400';
	for (var i = 0; i < 9; i++) {
		A[i] = new Array();
		B[i] = new Array();
		for (var j = 0; j < 9; j++) {
			A[i][j] = str.charAt(i * 9 + j);
			B[i][j] = str.charAt(i * 9 + j);
		}
	}
}

function inputByStringTemp() {
	A = new Array();
	for (var i = 0; i < 9; i++) {
		A[i] = new Array();
	}
	for (var i = 0; i < 81; i++) {
		A[i / 9][i % 9] = str[i] - '0';
	}
}

/**记录答案到result数组*/
function recordAns() {
	result = new Array();
	for (var i = 0; i < 9; i++) {
		result[i] = new Array();
	}

	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			result[i][j] = A[i][j];
		}
	}
}

function output() {
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			if (A[i][j] != 0) {
				document.getElementById('t' + i + j).innerHTML = A[i][j];
			} else {
				document.getElementById('t' + i + j).innerHTML = '';
				//document.getElementById('t' + i + j).style.backgroundColor = "skyblue";
			}
		}
	}
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			if (B[i][j] == 0) {
				document.getElementById('t' + i + j).style.backgroundColor = "skyblue";
			}
		}
	}
}


/**输出答案*/
function outputResult() {
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			if (result[i][j] != 0) {
				document.getElementById('t' + i + j).innerHTML = result[i][j];
			} else {
				document.getElementById('t' + i + j).innerHTML = '';
			}
		}
	}
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			if (B[i][j] == 0) {
				document.getElementById('t' + i + j).style.backgroundColor = "skyblue";
			}
		}
	}
}

function getBlock(row, col) {
	if (row <= 2) {
		if (col <= 2) return 0;
		else if (col <= 5) return 1;
		else return 2;
	} else if (row <= 5) {
		if (col <= 2) return 3;
		else if (col <= 5) return 4;
		else return 5;
	} else {
		if (col <= 2) return 6;
		else if (col <= 5) return 7;
		else return 8;
	}
}

//判断row行col列是否可以填写k
function judge(row, col, k) {
	for (var i = 0; i < 9; i++) {
		if (i != col && A[row][i] == k) {
			return 0;
		}
		if (i != row && A[i][col] == k) {
			return 0;
		}
	}
	var block = getBlock(row, col);
	var x = Math.floor(block / 3) * 3;
	var y = (block % 3) * 3;

	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			if (parseInt(A[x + i][y + j]) != 0 && parseInt(A[x + i][y + j]) == parseInt(k)) {
				return 0;
			}
		}
	}
	return 1;
}

function calNumberOfOne(tx) {
	var cnt = 0;
	var x = parseInt(tx);
	while (x > 0) {
		x = (x & (x - 1));
		cnt++;
	}
	return cnt;
}



/***以下是各种筛除法的函数实现,返回-1表示出错应该回溯，否则返回成功填写的数目*/
function filter() {
	var cnt = 0; //记录填的个数
	var value; //用于判断唯一数等性质
	value = new Array();
	for (var i = 0; i < 9; i++) {
		value[i] = new Array();
		for (var j = 0; j < 9; j++) {
			value[i][j] = 0;
		}
	}

	for (var i = 0; i < 9; i++)
		for (var j = 0; j < 9; j++)
			if (A[i][j] == 0)
				for (var k = 1; k <= 9; k++)
					if (judge(i, j, k) == 1)
						value[i][j] = (value[i][j] | (1 << (k - 1))); //用二进制串表示可以放置的数字

					/***唯一数法和唯一余数法*/
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			if (calNumberOfOne(value[i][j]) == 1) {
				cnt++;
				var t = value[i][j] & (-value[i][j]);
				value[i][j] = value[i][j] ^ t;
				for (var k = 0; k < 9; k++) {
					if ((t & (1 << k)) != 0) {
						if (judge(i, j, k + 1) == 0) return -1; //出错了就返回-1
						A[i][j] = k + 1;
						/*此处填写了新的值于是可以继续更新所在行和列以及宫*/
						var reverNum = ~(1 << (k));
						for (var u = 0; u < 9; u++) {
							value[i][u] = (value[i][u] & reverNum);
							value[u][j] = (value[u][j] & reverNum);
						}
						var block = getBlock(i, j);
						var x = Math.floor(block / 3) * 3;
						var y = (block % 3) * 3;
						for (var u = 0; u < 3; u++) {
							for (var v = 0; v < 3; v++) {
								value[x + u][y + v] = (value[x + u][y + v] & reverNum);
							}
						}
						break;
					}
				}
			}
		}
	}


	/***基础摒除法*/
	//首先是宫摒除法
	for (var block = 0; block < 9; block++) {
		var x = Math.floor(block / 3) * 3;
		var y = (block % 3) * 3;

		for (var k = 1; k <= 9; k++) {
			var isFilled = 0;
			for (var i = 0; i < 3 && (!isFilled); i++) {
				for (var j = 0; j < 3 && (!isFilled); j++) {
					if (A[x + i][y + j] == k) {
						isFilled = 1;
						break;
					}
				}
			}
			if (!isFilled) {
				var possiblePostion = 0;
				var px, py;
				for (var i = 0; i < 3; i++) {
					for (var j = 0; j < 3; j++) {
						if (A[x + i][y + j] == 0 && (value[x + i][y + j] & (1 << (k - 1))) != 0) {
							possiblePostion++;
							px = x + i;
							py = y + j;
						}
					}
				}

				if (possiblePostion == 0) return -1;
				if (possiblePostion == 1) // 发现了唯一的解，直接填上。
				{
					if (judge(px, py, k) == 0) return -1;
					A[px][py] = k;
					var reverNum = ~(1 << (k - 1));
					value[px][py] = (value[px][py] & reverNum);
					cnt++; //千万不要忘记了增加这个

					/*此处填写了新的值于是可以继续更新所在行和列以及宫,不知道这样是不是会更快，待测试，经过测试，确实很快*/
					for (var u = 0; u < 9; u++) {
						value[px][u] = (value[px][u] & reverNum);
						value[u][py] = (value[u][py] & reverNum);
					}

					for (var u = 0; u < 3; u++) {
						for (var v = 0; v < 3; v++) {
							value[x + u][y + v] = (value[x + u][y + v] & reverNum);
						}
					}
				}

			}
		}
	}

	//然后是行列摒除法
	for (var rowOrCol = 0; rowOrCol < 9; rowOrCol++) {
		for (var k = 1; k <= 9; k++) {
			//先处理行
			var isFilled = 0;
			for (var i = 0; i < 9; i++) {
				if (A[rowOrCol][i] == k) {
					isFilled = 1;
					break;
				}
			}
			if (!isFilled) {
				var possiblePostion = 0;
				var px, py;
				for (var i = 0; i < 9; i++) {
					if (A[rowOrCol][i] == 0 && (value[rowOrCol][i] & (1 << (k - 1))) != 0) {
						possiblePostion++;
						px = rowOrCol;
						py = i;
					}
				}
				if (possiblePostion == 0) return -1;
				if (possiblePostion == 1) {
					if (judge(px, py, k) == 0) return -1;
					A[px][py] = k;
					var reverNum = ~(1 << (k - 1));
					value[px][py] = (value[px][py] & reverNum);
					cnt++; //千万不要忘记了增加这个
					/*此处填写了新的值于是可以继续更新所在行和列以及宫*/
					for (var u = 0; u < 9; u++) {
						value[px][u] = (value[px][u] & reverNum);
						value[u][py] = (value[u][py] & reverNum);
					}

					var block = getBlock(px, py);
					var x = Math.floor(block / 3) * 3;
					var y = (block % 3) * 3;
					for (var u = 0; u < 3; u++) {
						for (var v = 0; v < 3; v++) {
							value[x + u][y + v] = (value[x + u][y + v] & reverNum);
						}
					}
				}
			}
			//再处理列
			isFilled = 0;
			for (var i = 0; i < 9; i++) {
				if (A[i][rowOrCol] == k) {
					isFilled = 1;
					break;
				}
			}
			if (!isFilled) {
				var possiblePostion = 0;
				var px, py;
				for (var i = 0; i < 9; i++) {
					if (A[i][rowOrCol] == 0 && (value[i][rowOrCol] & (1 << (k - 1))) != 0) {
						possiblePostion++;
						px = i;
						py = rowOrCol;
					}
				}
				if (possiblePostion == 0) return -1;
				if (possiblePostion == 1) {
					if (judge(px, py, k) == 0) return -1;
					A[px][py] = k;
					var reverNum = ~(1 << (k - 1));
					value[px][py] = (value[px][py] & reverNum);
					cnt++; //千万不要忘记了增加这个
					/*此处填写了新的值于是可以继续更新所在行和列以及宫*/
					for (var u = 0; u < 9; u++) {
						value[px][u] = (value[px][u] & reverNum);
						value[u][py] = (value[u][py] & reverNum);
					}

					var block = getBlock(px, py);
					var x = Math.floor(block / 3) * 3;
					var y = (block % 3) * 3;
					for (var u = 0; u < 3; u++) {
						for (var v = 0; v < 3; v++) {
							value[x + u][y + v] = (value[x + u][y + v] & reverNum);
						}
					}
				}
			}
		}
	}

	/**
	 *行列摒除之后再来一次唯一数和唯一余数，利用摒除带来的可能唯一解,后面的摒除之后都一样
	 *
	 */
	//        for(var i = 0; i < 9; i++)
	//        {
	//            for(var j = 0; j < 9; j++)
	//            {
	//                if(calNumberOfOne(value[i][j]) == 1)
	//                {
	//                    cnt++;
	//                    var t =  value[i][j] & (-value[i][j]);
	//                    value[i][j] =  value[i][j] ^ t;
	//                    for(var k = 0; k < 9; k++)
	//                    {
	//                        if((t & (1 << k)) != 0)
	//                        {
	//                            if(!judge(i, j, k + 1))return -1; //出错了就返回-1
	//                            A[i][j] = k + 1;
	//                            /*此处填写了新的值于是可以继续更新所在行和列以及宫*/
	//                            var reverNum = ~(1 << (k));
	//                            for(var u = 0; u < 9; u++)
	//                            {
	//                                value[i][u] = (value[i][u] & reverNum);
	//                                value[u][j] = (value[u][j] & reverNum);
	//                            }
	//                            var block = getBlock(i, j);
	//                            var x = Math.floor(block / 3) * 3;
	//                            var y = (block % 3) * 3;
	//                            for(var u = 0; u < 3; u++)
	//                            {
	//                                for(var v = 0; v < 3; v++)
	//                                {
	//                                    value[x + u][y + v] = (value[x + u][y + v] & reverNum);
	//                                }
	//                            }
	//                            break;
	//                        }
	//                    }
	//                }
	//            }
	//        }

	/****/


	return cnt;
}



/***核心搜索函数，注意误解的情况*/
function dfs(resNum) {
	
	if (finish == 1) return;
	if (resNum <= 0) {
		recordAns();
		finish = 1;
	} else {
		/***该部分使用数独的技巧进行筛除*/
		
		var Bak;
		Bak = new Array();
		for (var i = 0; i < 9; i++) {
			Bak[i] = new Array();
		}
		//缓存到B数组
		for (var i = 0; i < 9; i++)
			for (var j = 0; j < 9; j++)
				Bak[i][j] = A[i][j];


		var decrease = filter();
		if (resNum - decrease <= 0) //筛除了之后就完成了
		{
			recordAns();
			finish = 1;
			return 1;
		}
		if (decrease < 0) //筛除了之后返现错误
		{
			//回复A数组
			for (var i = 0; i < 9; i++)
				for (var j = 0; j < 9; j++)
					A[i][j] = Bak[i][j];
			return 1;
		}



		/***筛除部分结束，以下开始搜索*/


		var value; //用于启发式搜素，目前使用的是遍历81个格子，可以改进为log级别的。
		value = new Array();
		for (var i = 0; i < 9; i++) {
			value[i] = new Array();
			for (var j = 0; j < 9; j++) {
				value[i][j] = 0;
			}
		}
		for (var i = 0; i < 9; i++)
			for (var j = 0; j < 9; j++)
				if (A[i][j] == 0)
					for (var k = 1; k <= 9; k++)
						if (judge(i, j, k))
							value[i][j] = (value[i][j] | (1 << (k - 1))); //用二进制串表示可以放置的数字

		var ma = 10;
		var x, y;
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {
				var tval = calNumberOfOne(value[i][j]);
				if (tval > 0 && tval < ma) {
					ma = tval;
					x = i;
					y = j;
				}
			}
		}

		//不能扩展了
		if (ma == 10) return 1;

		//这里就是按照顺序选的，之后可能可以考虑一下
		for (var k = 1; k <= ma; k++) {
			var t = value[x][y] & (-value[x][y]);
			value[x][y] = value[x][y] ^ t;
			for (var i = 0; i < 9; i++) {
				if ((t & (1 << i)) != 0) {
					A[x][y] = i + 1;
					break;
				}
			}
			dfs(resNum - 1 - decrease);
			A[x][y] = 0;
			if (finish == 1) return;
		}

		//恢复A数组
		for (var i = 0; i < 9; i++)
			for (var j = 0; j < 9; j++)
				A[i][j] = Bak[i][j];
	}
}

function startRun() {
	//计时功能
	//	double dur;
	//	clock_t start, end;
	//	start = clock();

	var num = 0;
	finish = 0;
	for (var i = 0; i < 9; i++)
		for (var j = 0; j < 9; j++)
			if (A[i][j] == 0)
				num++;
	dfs(num);
		output();
	if (finish == 0) {
		alert("No soluton!");
	}else{
		outputResult();
	}
	//	end = clock();
	//	dur = (double)(end - start);
	//	prvarf("Use Time:%f\n", (dur / CLOCKS_PER_SEC));
	return finish;
}

/**生成一个数独游戏*/
function generateSudoku(difficulty) {
	var row, col, val;
	var ok;
	while (true) {
		ok = 0;

		A = new Array();
		B = new Array();
		result = new Array();

		for (var i = 0; i < 9; i++) {
			A[i] = new Array();
			B[i] = new Array();
			result[i] = new Array();
		}

		for (var i = 0; i < 9; i++) {
			col = Math.round(Math.random() * 100000) % 9;
			val = (Math.round(Math.random() * 100000) % 9) + 1;
			if (judge(i, col, val) == 0) break;
			A[i][col] = val;
			if (i == 8) ok = 1;
		}
		if (ok && startRun()) break;
	}
	for (var i = 0; i < difficulty; i++) {
		while (true) {
			row = Math.round(Math.random() * 100000) % 9;
			col = Math.round(Math.random() * 100000) % 9;
			if (result[row][col] != 0) {
				result[row][col] = 0;
				break;
			}
		}
	}
	for (var i = 0; i < 9; i++)
		for (var j = 0; j < 9; j++) {
			A[i][j] = result[i][j];
			B[i][j] = result[i][j];
		}
	outputResult();
}