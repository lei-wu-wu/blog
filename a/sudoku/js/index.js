/*
 *	作者：Araleii
 *	邮箱:araleiiiiii@gmail.com
 *	时间：2015-08-01
 *	描述：数独
 */

var A;
var B;
var result; //用于存放答案
var finish; //是否找打解
var sumStatus; //记录总的搜索的状态数
var beginDate; //记录程序开始时间
var endDate; //记录程序结束时间
var duration; //记录总的使用时间

function inputByString() {
	A = new Array();
	B = new Array();

	str = '412560879086472500053001024075249386029605140364718290530900760008127450247056918';
	str = '930856412461907850250341906080014205610205087705630040806473021042109738173582094';
	str = '679301408350780261182504973421853000035000120000142385298405617513076049706908532';
	str = '084203571203517094070098236357042160408601702021870349816750020530124607742306910';
	str = '109805736060019802785632019900563178850901064617284003470356921506120040231407605';
	str = '456301082073205641812647005648750093020904060390016274500478329289103450730509816';
	str = '096437018148009307023618490005174932071903650439526700057862140602300879380791520';
	str = '001002300043000002050100000000006020400257003070800000000003080800000750005600100';
	str = '080006010500803000090040500402000000900010008000000905005060040000204001060900030';
	str = '800000000003600000070090200050007000000045700000100030001000068008500010090000400';
	str = '000000000000000000000000000000000000000000000000000000000000000000000000000000000';
	str = '810003290067000000900500006000408000604000809000209000700001008000000370053800042';
	str = '000106400020040000500209070000000019300607004260000000050908002000050040009304000';
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
			document.getElementById('t' + i + j).style.backgroundColor = "skyblue";
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
				document.getElementById('t' + i + j).style.backgroundColor = "white";
			}
		}
	}
}

function showInputBlank() {

	document.getElementById("startRun").style.display = "none";

	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			document.getElementById('t' + i + j).style.backgroundColor = "white";
		}
	}

	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			document.getElementById('t' + i + j).innerHTML = '<input style=\"width: 27px;\" type=\"text\" id=\"i' + i + j + '\" value=\"\" />'
		}
	}
	document.getElementById("showInputBlank").style.display = "none";
	document.getElementById("confirmInput").style.display = "";
}

function confirmInput() {
	A = new Array();
	B = new Array();
	for (var i = 0; i < 9; i++) {
		A[i] = new Array();
		B[i] = new Array();
		for (var j = 0; j < 9; j++) {
			if (document.getElementById('i' + i + j).value != '') {
				A[i][j] = document.getElementById('i' + i + j).value;
				B[i][j] = document.getElementById('i' + i + j).value;
			} else {
				A[i][j] = 0;
				B[i][j] = 0;
			}
		}
	}
	document.getElementById("showInputBlank").style.display = "";
	document.getElementById("confirmInput").style.display = "none";
	output();
	document.getElementById("startRun").style.display = "";
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

	var statuStr = '<div class="alert alert-dismissable alert-info">' + '<h4>' + '通过启发式搜索和数独技巧的剪枝<br/><br/><br/>一共搜索了<strong>' + sumStatus + '</strong>个状态' + '</br><br/><br/>一共用时<strong>' + duration + '</strong>ms'; + '</h4>' + '</div>';



	document.getElementById("showTimes").innerHTML = statuStr;
	//	document.getElementById("showDuration").innerHTML = '一共用时'+duration + 'ms';
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
	if (k == 0) return 0;
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
			if ((row != (x + i) || col != y + j) && parseInt(A[x + i][y + j]) != 0 && parseInt(A[x + i][y + j]) == parseInt(k)) {
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
	//宫摒除和区块判断，同时进行矩阵摒除的考虑
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
			//行为主的测试
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
			//列为主的测试
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
	 *行列摒除之后再来一次唯一数和唯一余数，利用摒除带来的可能唯一解,后面的摒除之后都一样,之前效率已经足够，此处加上反而整体使得效率降低
	 * 所以并不建议使用
	 *
	 */
	//	        for(var i = 0; i < 9; i++)
	//	        {
	//	            for(var j = 0; j < 9; j++)
	//	            {
	//	                if(calNumberOfOne(value[i][j]) == 1)
	//	                {
	//	                    cnt++;
	//	                    var t =  value[i][j] & (-value[i][j]);
	//	                    value[i][j] =  value[i][j] ^ t;
	//	                    for(var k = 0; k < 9; k++)
	//	                    {
	//	                        if((t & (1 << k)) != 0)
	//	                        {
	//	                            if(!judge(i, j, k + 1))return -1; //出错了就返回-1
	//	                            A[i][j] = k + 1;
	//	                            /*此处填写了新的值于是可以继续更新所在行和列以及宫*/
	//	                            var reverNum = ~(1 << (k));
	//	                            for(var u = 0; u < 9; u++)
	//	                            {
	//	                                value[i][u] = (value[i][u] & reverNum);
	//	                                value[u][j] = (value[u][j] & reverNum);
	//	                            }
	//	                            var block = getBlock(i, j);
	//	                            var x = Math.floor(block / 3) * 3;
	//	                            var y = (block % 3) * 3;
	//	                            for(var u = 0; u < 3; u++)
	//	                            {
	//	                                for(var v = 0; v < 3; v++)
	//	                                {
	//	                                    value[x + u][y + v] = (value[x + u][y + v] & reverNum);
	//	                                }
	//	                            }
	//	                            break;
	//	                        }
	//	                    }
	//	                }
	//	            }
	//	        }

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
		sumStatus++; //新的状态数加1
		//alert("1");
		//output();
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


		//alert("2");
		//output();
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

	//回复手动输入的状态
	document.getElementById("showInputBlank").style.display = "";
	document.getElementById("confirmInput").style.display = "none";

	//计时功能
	beginDate = new Date();

	var num = 0;
	finish = 0;
	sumStatus = 0;

	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			if (A[i][j] != 0 && judge(i, j, A[i][j]) == 0) {
				alert("No sulotion!");
				return;
			}
		}
	}

	for (var i = 0; i < 9; i++)
		for (var j = 0; j < 9; j++)
			if (A[i][j] == 0)
				num++;
	dfs(num);

	endDate = new Date();
	duration = endDate.getTime() - beginDate.getTime();

	if (finish == 0) {
		alert("No soluton!");
	} else {
		outputResult();
	}

	return finish;
}

/**和startRun一样的，只是没有输出，用于判断是否生成了合法的数独*/
function isRightSudoku() {
	var num = 0;
	finish = 0;
	sumStatus = 0;

	for (var i = 0; i < 9; i++)
		for (var j = 0; j < 9; j++)
			if (A[i][j] == 0)
				num++;
	dfs(num);
	return finish;
}



/**生成一个数独游戏*/
function generateSudoku(difficulty) {

	//回复手动输入的状态
	document.getElementById("showInputBlank").style.display = "";
	document.getElementById("confirmInput").style.display = "none";

	var row, col, val;
	var ok;
	A = new Array();
	B = new Array();
	result = new Array();
	for (var i = 0; i < 9; i++) {
		A[i] = new Array();
		B[i] = new Array();
		result[i] = new Array();
	}

	while (true) {
		ok = 0;
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {
				A[i][j] = 0;
				B[i][j] = 0;
			}
		}

		for (var i = 0; i < 9; i++) {
			col = Math.round(Math.random() * 100000) % 9;
			val = (Math.round(Math.random() * 100000) % 9) + 1;
			if (judge(i, col, val) == 0) break;
			A[i][col] = val;

			if (i == 8) ok = 1;
		}
		if (ok && isRightSudoku()) break;
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
	output();
	document.getElementById("startRun").style.display = "";
}