App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
  
  init: async () =>{
    // Load candidates.
    $.getJSON('../candidates.json', function(data) {
      let content = $('#content');
      let candidateTemplate = $('#candidateTemplate');
     for (let i in data) {

      if(data.hasOwnProperty(i))       
      {
      candidateTemplate.find('.panel-title').text(data[i].name);         

      candidateTemplate.find('.candidate-name').text(data[i].name);
      candidateTemplate.find('img').attr('src', data[i].picture);
      
      candidateTemplate.find('.candidate-age').text(data[i].age);
      candidateTemplate.find('.candidate-post').text(data[i].post);
    
      candidateTemplate.find('.btn-vote').attr('data-id', data[i].id);
   

      //document.querySelector(".candidate-name").innerHTML = `${name}`;
      
      content.append(candidateTemplate.html());}
     
     
      };
    });
    return await App.initWeb3();   
    
  },
  
    initWeb3: async ()=> {
     if(window.ethereum){

      App.web3Provider = window.ethereum;
      try{
        await window.ethereum.enable();
      }catch(error){
        console.error ("User denied account access")
      }
     }
     else if (window.web3){
       App.web3Provider = window.web3.currentProvider;
     }
     else{
       App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
       web3 = new Web3(App.web3Provider);
     }
    //  web3 = new Web3(App.web3Provider);
     return App.initContract();

 },

  initContract: ()=> {
    $.getJSON("Election.json", (election) => {
      
      App.contracts.Election = TruffleContract(election);
      
      App.contracts.Election.setProvider(App.web3Provider);
      
     return App.render();
     
    }
    );   
    
    return App.bindEvents();
    
    //return App.render();  
  },

  bindEvents: () => {
    $(document).on('click', '.btn-vote', App.castVote);
  },

  
  render: async () => {
    try{ 
      
      var loader= $("#loader");
      var content = $("#content");     

      loader.show();
      content.hide();    

      //load account data
      web3.eth.getCoinbase(function(err, account){
        if (err===null){
          App.account = account;
          let a = document.querySelector("#accountAddress").innerHTML= `Your Account: ${account}`;
          console.log(a)
        }
      });     
      
      //load Contract data
      
      let instance = await App.contracts.Election.deployed();
         
      const candidatesCount = await instance.candidatesCount.call();
            
        let candidatesResults = $("#candidatesResults");
        candidatesResults.empty();

        for (let i = 1; i<=candidatesCount; i++){     
                    
          let candidate = await instance.candidates(i);
                      
          let id = candidate[0];    
          
          let name = candidate[1];
        
          let voteCount = candidate[2];       
          
            const candidatesResults = document.querySelector('#candidatesResults');
              
            const row = document.createElement('tr');

            row.innerHTML =`
            <td> ${id} </td>
            <td> ${name}</td>
            <td> ${voteCount}</td>
            `;
            
            candidatesResults.append(row); 
               
          };
          
        
       hasVoted = await instance.voters(App.account) ;   
        

      if(hasVoted){
      content1.hide();
    }
      loader.hide();
      content.show();
      throw new Error("oops");}
      catch(err){
        console.log(err)
      }

  }, 
  


  castVote : async(e) => {
    e.preventDefault();
    

    try{    
      let candidateId = parseInt($(event.target).data('id'));
      console.log(candidateId);

      let instance = await App.contracts.Election.deployed();
      let voting = await instance.vote(candidateId, {from: App.account,gas:"500000"});     
   

      //disable button during process
     // $(this).text('Processing..').attr('disabled', true);
  
      web3.eth.getAccounts((accounts,error) => {
        if(error){
          console.log(error); 
        }
       // let account= accounts[0];
        

        // let instance = await App.contracts.Election.deployed();
        // console.log (instance);  
        if (voting){
        alert('Voting Successful!');   }
        else{
          alert('Not Successful')
        }     
        var loader= $("#loader");
        var content = $("#content");     
  
        content.show();
        loader.hide();
        
          
        //document.querySelector('#content').attr('disable', true);
        //document.querySelector('#loader').attr('disable', false);
          //$("#candidateTemplate").hide();
          //$("#loader").show();
          //return App.render();

        })
      }       
        catch(err){
          //enable button again on error
          //$(this).text('vote').removeAttr('disabled');
          console.log(err.message);
       } 
  },
};

$(()=> {
  $(window).load(()=> {
    App.init();
  });
});
