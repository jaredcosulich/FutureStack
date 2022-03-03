import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'
import { FutureStackLayout, TWCircleSpinner } from "../../../../components"
import ContractsDashboard from "../../../../components/contracts/ContractsDashboard";
import { simpleApiCall } from '../../../../lib';

const ContractsPage = () => {
  const router = useRouter()
  const projectId = router.query.id 
  
  const [project, setProject] = useState()

  useEffect(() => {
    if (!projectId) return;

    const getProject = async () => {
      const { json, error } = await simpleApiCall(
        `projects/${projectId}`,
        'GET'
      )
      setProject(json)
    }

    getProject()
  }, [projectId])

  return (
    <FutureStackLayout>
      {!project &&
        <TWCircleSpinner
          message='Loading project...'
        />
      }
      {project &&
        <ContractsDashboard 
          project={project}
        />
      }
    </FutureStackLayout>
  )
}

export default ContractsPage;