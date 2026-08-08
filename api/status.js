export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'GET only'});
  const runId=Number(req.query?.run_id);
  if(!Number.isInteger(runId)||runId<=0)return res.status(400).json({error:'Invalid build id'});
  if(!process.env.GITHUB_TOKEN)return res.status(500).json({error:'Build service is not configured yet'});
  const h={Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  try{
    const r=await fetch(`https://api.github.com/repos/ashbelz123-droid/Ash-web2app-cove/actions/runs/${runId}`,{headers:h});
    if(!r.ok)return res.status(502).json({error:'Could not read build status'});
    const run=await r.json();
    const out={run_id:run.id,status:run.status,conclusion:run.conclusion};
    if(run.status==='completed'&&run.conclusion==='success'){
      const a=await fetch(`https://api.github.com/repos/ashbelz123-droid/Ash-web2app-cove/actions/runs/${runId}/artifacts?name=web2app-`,{headers:h});
      const all=await fetch(`https://api.github.com/repos/ashbelz123-droid/Ash-web2app-cove/actions/runs/${runId}/artifacts`,{headers:h});
      const data=await all.json();const artifact=data.artifacts?.find(x=>!x.expired&&x.name.startsWith('web2app-'));
      if(artifact)out.download_url=`/api/download?artifact_id=${artifact.id}`;
    }
    return res.status(200).json(out);
  }catch{return res.status(500).json({error:'Build status request failed'});}
}
